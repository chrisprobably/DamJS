define(['lib/react'], function(React) {
	var listStyle = {
		border: "1px solid lightgrey",
		borderRadius: "5px",
		padding: "5px",
		margin: "5px"
	}

	var columnStyle = {
		width: "260px",
		height: "160px",
		padding: "20px",
		float: "left",
		backgroundColor: "white",
		overflowY: "auto"
	}

	var InjectorConfigElement = React.createClass({
		getInitialState: function() {
			if (this.props.matcher) {
				return {
					incomingInjectionFields: this.props.matcher.incomingInjectionFields,
					outgoingInjectionFields: this.props.matcher.outgoingInjectionFields
				}
			}
			return {
				incomingInjectionFields: [],
				outgoingInjectionFields: []
			}
		},
		componentWillReceiveProps: function(props) {
			debugger;
			if (this.props.matcher) {
				this.props.matcher.clearReact(this);
			}
			if (props.matcher) {
				props.matcher.setReact(this);
			}
		},
		componentDidMount: function() {
			this.props.matcher.setReact(this);
		},
		addIncomingRow: function() {
			this.props.matcher.addIncomingInjectionField();
		},
		addOutgoingRow: function() {
			this.props.matcher.addOutgoingInjectionField();
		},
		onIncomingValueChange: function(e) {
			this.props.matcher.updateIncomingInjectionValue(Number.parseInt(e.target.attributes.getNamedItem('data').value), e.target.value);
		},
		onIncomingKeyChange: function(e) {
			this.props.matcher.updateIncomingInjectionKey(Number.parseInt(e.target.attributes.getNamedItem('data').value), e.target.value);
		},
		onOutgoingValueChange: function(e) {
			this.props.matcher.updateOutgoingInjectionValue(Number.parseInt(e.target.attributes.getNamedItem('data').value), e.target.value);
		},
		onOutgoingKeyChange: function(e) {
			this.props.matcher.updateOutgoingInjectionKey(Number.parseInt(e.target.attributes.getNamedItem('data').value), e.target.value);
		},
		render: function() {
			var style = {
				width: "100px"
			}
			if (this.props.matcher) {
				var incomingRows = [];
				var outgoingRows = [];
				for (var i=0; i < this.state.incomingInjectionFields.length; i++) {
					incomingRows.push(React.DOM.div(null,
						React.DOM.input({style: style, data:i, onChange: this.onIncomingKeyChange, value: this.state.incomingInjectionFields[i].keyValue}),
						React.DOM.input({style: style, data:i, onChange: this.onIncomingValueChange, value: this.state.incomingInjectionFields[i].fieldValue})
					));
				}
				for (var i=0; i < this.state.outgoingInjectionFields.length; i++) {
					outgoingRows.push(React.DOM.div(null,
						React.DOM.input({style: style, data:i, onChange: this.onOutgoingKeyChange, value: this.state.outgoingInjectionFields[i].keyValue}),
						React.DOM.input({style: style, data:i, onChange: this.onOutgoingValueChange, value: this.state.outgoingInjectionFields[i].fieldValue})
					));
				}
				return React.DOM.div({style: columnStyle},
					React.DOM.div(null,
						"Inject Incoming Elements",
						incomingRows,
						React.DOM.button({onClick: this.addIncomingRow}, "Add Incoming Row")),
					React.DOM.div(null,
						"Inject Outgoing Elements",
						outgoingRows,
						React.DOM.button({onClick: this.addOutgoingRow}, "Add Outgoing Row")));
			} else {
				return React.DOM.div();
			}
		}
	})

	var DamJSElement = React.createClass({
		getInitialState: function() {
			this.props.damJS.onUpdate(function() {
				this.setState({
					damJS: this.props.damJS
				})
			}.bind(this))
			return {
				damJS: this.props.damJS
			}
		},
		render: function() {
			var divStyle = {
				background: "white",
				color: "black",
//			borderRadius: "5px",
//			padding: "5px",
				paddingTop: "30px",
				position: "relative",
				width: "300px",
				height: "200px",
				zIndex: 100000
			}
			return React.DOM.div({style: divStyle, className: "drag"},
				MatcherListElement({matchers: this.state.damJS.matchers}));
		}
	})

	var SubjectAdder = React.createClass({
		getInitialState: function() {
			return {value: ""}
		},
		addSubject: function() {
			this.props.damJS.addNewMatcher(this.state.value);
		},
		onInputChange: function(e){
			this.setState({value:e.target.value});
		},
		render: function() {
			var style= {
				width: "140px"
			}
			return React.DOM.div(null,
				React.DOM.input({style: style, value: this.state.value, onChange: this.onInputChange}),
				React.DOM.button({onClick: this.addSubject}, "Add Subject")
			)
		}
	})

	var MatcherListElement = React.createClass({
		getInitialState: function() {
			return {selectedMatcher: null, viewOpened: "none"}
		},
		selectMatcher: function(matcher) {
			this.setState({selectedMatcher: matcher});
		},
		setViewOpened: function(view) {
			this.setState({viewOpened: view});
		},
		render: function() {
			var style = {
				width: "1250px"
			}
			var matchersList = [];
			this.props.matchers.forEach(function(matcher) {
				matchersList.push(MatcherElement({selectMatcher: this.selectMatcher, matcher: matcher}));
			}.bind(this))

			var returnedElements = [];
			returnedElements.push(React.DOM.div({style: columnStyle},
				SubjectAdder({damJS: this.props.damJS}),
				React.DOM.div(null, matchersList)));
			if (this.state.selectedMatcher) {
				returnedElements.push(React.DOM.div({style: columnStyle},
					MatcherConfigElement({matcher: this.state.selectedMatcher, setViewOpened: this.setViewOpened})));
			}
			if (this.state.viewOpened == "inject") {
				returnedElements.push(React.DOM.div({style: columnStyle},
					InjectorConfigElement({matcher: this.state.selectedMatcher})));
			}
			if (this.state.viewOpened == "captured") {
				returnedElements.push(React.DOM.div({style: columnStyle},
					CapturedPacketListElement({matcher: this.state.selectedMatcher})));
			}

			return React.DOM.div({style: style},returnedElements);
		}
	});

	var MatcherButton = React.createClass({
		getInitialState: function() {
			return {
				style: {backgroundColor: "lightgrey"},
				openOrFiltered: "Off"
			}
		},
		componentWillReceiveProps: function(props) {
			this.setFiltered();
		},
		toggleFilter: function() {
			this.props.toggleFilter();
			this.setFiltered()
		},
		setFiltered: function() {
			if (this.props.isFiltered())  {
				this.setState({
					style: {backgroundColor: "lightgreen"},
					openOrFiltered: "On"
				});
			} else {
				this.setState({
					style: {backgroundColor: "lightgrey"},
					openOrFiltered: "Off"
				});
			}
		},
		render: function() {
			return React.DOM.button({onClick: this.toggleFilter, style: this.state.style}, this.props.buttonLabel /* + " " +this.state.openOrFiltered*/);
		}
	})

	var MatcherFilterIncomingButton = React.createClass({
		isFiltered: function() {
			return this.props.matcher.isIncomingFiltered();
		},
		toggleFilter: function() {
			this.props.matcher.toggleIncomingFilter();
		},
		render: function() {
			return MatcherButton({isFiltered: this.isFiltered,toggleFilter: this.toggleFilter, buttonLabel: "Incoming"})
		}
	})

	var MatcherFilterOutgoingButton = React.createClass({
		isFiltered: function() {
			return this.props.matcher.isOutgoingFiltered();
		},
		toggleFilter: function() {
			this.props.matcher.toggleOutgoingFilter();
		},
		render: function() {
			return MatcherButton({isFiltered: this.isFiltered,toggleFilter: this.toggleFilter, buttonLabel: "Outgoing"})
		}
	})

	var MatcherInjectIncomingButton = React.createClass({
		isFiltered: function() {
			return this.props.matcher.isIncomingInjected();
		},
		toggleFilter: function() {
			this.props.matcher.toggleIncomingInjection();
		},
		render: function() {
			return MatcherButton({isFiltered: this.isFiltered,toggleFilter: this.toggleFilter, buttonLabel: "Incoming"})
		}
	})

	var MatcherInjectOutgoingButton = React.createClass({
		isFiltered: function() {
			return this.props.matcher.isOutgoingInjected();
		},
		toggleFilter: function() {
			this.props.matcher.toggleOutgoingInjection();
		},
		render: function() {
			return MatcherButton({isFiltered: this.isFiltered,toggleFilter: this.toggleFilter, buttonLabel: "Outgoing"})
		}
	})

	var MatcherLoggerIncomingButton = React.createClass({
		isFiltered: function() {
			return this.props.matcher.isIncomingLogged();
		},
		toggleFilter: function() {
			this.props.matcher.toggleIncomingLogging();
		},
		render: function() {
			return MatcherButton({isFiltered: this.isFiltered,toggleFilter: this.toggleFilter, buttonLabel: "Incoming"})
		}
	})

	var MatcherLoggerOutgoingButton = React.createClass({
		isFiltered: function() {
			return this.props.matcher.isOutgoingLogged();
		},
		toggleFilter: function() {
			this.props.matcher.toggleOutgoingLogging();
		},
		render: function() {
			return MatcherButton({isFiltered: this.isFiltered,toggleFilter: this.toggleFilter, buttonLabel: "Outgoing"})
		}
	})

	var MatcherConfigElement = React.createClass({
		render: function() {
			var textStyle = {display: "inline-block", minWidth: "40px"};
			var buttonStyle = {backgroundColor: "lightgrey"};
			if (this.props.matcher) {
				return React.DOM.div(null,
					React.DOM.div(null, this.props.matcher.matchString),
					React.DOM.div(null,
						React.DOM.span({style: textStyle},"Filter"), MatcherFilterIncomingButton({matcher: this.props.matcher}),
						MatcherFilterOutgoingButton({matcher: this.props.matcher}),
						React.DOM.button({style: buttonStyle, onClick: function() {this.props.setViewOpened("captured")}.bind(this)}, "View")
					),
					React.DOM.div(null,
						React.DOM.span({style: textStyle},"Inject"), MatcherInjectIncomingButton({matcher: this.props.matcher}),
						MatcherInjectOutgoingButton({matcher: this.props.matcher}),
						React.DOM.button({style: buttonStyle, onClick: function() {this.props.setViewOpened("inject")}.bind(this)}, "Conf")
					),
					React.DOM.div(null,
						React.DOM.span({style: textStyle},"Log"), MatcherLoggerIncomingButton({matcher: this.props.matcher}),
						MatcherLoggerOutgoingButton({matcher: this.props.matcher})
					)
				);
			} else {
				return React.DOM.div();
			}
		}
	})

	var MatcherElement = React.createClass({
		selectMatcher: function() {
			this.props.selectMatcher(this.props.matcher)
		},
		render: function() {
			return React.DOM.div({onClick: this.selectMatcher},this.props.matcher.matchString);
		}
	});

	var CapturedPacketListElement = React.createClass({
		getInitialState: function() {
			return {
				matches: []
			}
		},
		componentWillReceiveProps: function(props) {
			if (this.props.matcher) {
				this.props.matcher.clearReact(this);
			}
			if (props.matcher) {
				props.matcher.setReact(this);
			}
		},
		componentDidMount: function() {
			this.props.matcher.setReact(this);
		},
		render: function() {
			var packetList = [];
			if (this.state.matches && this.state.matches.length > 0) {
				this.state.matches.forEach(function(joinPoint) {
					packetList.push(CapturedPacketElement({joinPoint: joinPoint}));
				})
				return React.DOM.div({style: columnStyle}, packetList);
			}
			return React.DOM.div();
		}
	});

	var CapturedPacketElement = React.createClass({
		render: function() {
			return React.DOM.div(null,this.props.joinPoint.target.getSubject());
		}
	});

	return DamJSElement;
}) ;
