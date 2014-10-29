var listStyle = {
	border: "1px solid lightgrey",
	borderRadius: "5px",
	padding: "5px",
	margin: "5px"
}

var columnStyle = {
	width: "300px",
	float: "left"
}

var InjectorRowElement = React.createClass({
	render: function() {
		return React.DOM.div(null, React.DOM.input(null),React.DOM.input(null)); //React.DOM.button({},"Delete")
	}
})

var InjectorConfigElement = React.createClass({
	getInitialState: function() {
		return {
			incomingInjectionFields: [],
			outgoingInjectionFields: []
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
	addIncomingRow: function() {
		this.props.matcher.addIncomingInjectionField();
	},
	addOutgoingRow: function() {
		this.props.matcher.addOutgoingInjectionField();
	},
	onIncomingFieldChange: function(e) {
		this.props.matcher.updateIncomingInjectionField(Number.parseInt(e.target.attributes.getNamedItem('data').value), e.target.value);
	},
	onIncomingKeyChange: function(e) {
		this.props.matcher.updateIncomingInjectionField(Number.parseInt(e.target.attributes.getNamedItem('data').value), e.target.value);
	},
	onOutgoingFieldChange: function(e) {
		this.props.matcher.updateOutgoingInjectionField(Number.parseInt(e.target.attributes.getNamedItem('data').value), e.target.value);
	},
	onOutgoingKeyChange: function(e) {
		this.props.matcher.updateOutgoingInjectionField(Number.parseInt(e.target.attributes.getNamedItem('data').value), e.target.value);
	},
	render: function() {
		if (this.props.matcher) {
			var incomingRows = [];
			var outgoingRows = [];
			for (var i=0; i < this.state.incomingInjectionFields.length; i++) {
				incomingRows.push(React.DOM.div(null,
					React.DOM.input({data:i, onChange: this.onIncomingKeyChange, value: this.state.incomingInjectionFields[i].keyValue}),
					React.DOM.input({data:i, onChange: this.onIncomingFieldChange, value: this.state.incomingInjectionFields[i].fieldValue})
				));//InjectorRowElement());
			}
			for (var i=0; i < this.state.outgoingInjectionFields.length; i++) {
				outgoingRows.push(React.DOM.div(null,
					React.DOM.input({data:i, onChange: this.onOutgoingKeyChange, value: this.state.outgoingInjectionFields[i].keyValue}),
					React.DOM.input({data:i, onChange: this.onOutgoingFieldChange, value: this.state.outgoingInjectionFields[i].fieldValue})
				));//InjectorRowElement());
			}
			return React.DOM.div(null,
				"Inject Incoming Elements",
				incomingRows,
				React.DOM.button({onClick: this.addIncomingRow}, "Add Incoming Row"),
				"Inject Outgoing Elements",
				outgoingRows,
				React.DOM.button({onClick: this.addOutgoingRow}, "Add Outgoing Row"));
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
			borderRadius: "5px",
			padding: "5px",
			paddingTop: "30px",
			position: "relative",
			width: "300px",
			zIndex: 100000
		}
		return React.DOM.div({style: divStyle, className: "drag"},
			SubjectAdder({damJS: this.props.damJS}),
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
		return React.DOM.div(null,
			React.DOM.input({value: this.state.value, onChange: this.onInputChange}),
			React.DOM.button({onClick: this.addSubject}, "Add Subject")
		)
	}
})

var MatcherListElement = React.createClass({
	getInitialState: function() {
		return {selectedMatcher: null}
	},
	selectMatcher: function(matcher) {
		this.setState({selectedMatcher: matcher});
	},
	render: function() {
		var style = {
			width: "1250px"
		}
		var matchersList = [];
		this.props.matchers.forEach(function(matcher) {
			matchersList.push(MatcherElement({selectMatcher: this.selectMatcher, matcher: matcher}));
		}.bind(this))

		return React.DOM.div({style: style},
			React.DOM.div({style: columnStyle}, matchersList),
			React.DOM.div({style: columnStyle}, MatcherConfigElement({matcher: this.state.selectedMatcher})),
			React.DOM.div({style: columnStyle}, InjectorConfigElement({matcher: this.state.selectedMatcher})),
			React.DOM.div({style: columnStyle}, CapturedPacketListElement({matcher: this.state.selectedMatcher}))
		);
  }
});

var MatcherButton = React.createClass({
	getInitialState: function() {
		return {
			style: this.props.isFiltered() ? {backgroundColor: "lightgreen"} : {backgroundColor: "lightgreen"},
			openOrFiltered: this.props.isFiltered() ? "On" : "Off"
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
				style: {backgroundColor: "pink"},
				openOrFiltered: "On"
			});
		} else {
			this.setState({
				style: {backgroundColor: "lightgreen"},
				openOrFiltered: "Off"
			});
		}
	},
	render: function() {
		return React.DOM.button({onClick: this.toggleFilter, style: this.state.style}, this.props.buttonLabel + " " + this.state.openOrFiltered);
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
		return MatcherButton({isFiltered: this.isFiltered,toggleFilter: this.toggleFilter, buttonLabel: "Filter Incoming"})
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
		return MatcherButton({isFiltered: this.isFiltered,toggleFilter: this.toggleFilter, buttonLabel: "Filter Outgoing"})
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
		return MatcherButton({isFiltered: this.isFiltered,toggleFilter: this.toggleFilter, buttonLabel: "Inject Incoming"})
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
		return MatcherButton({isFiltered: this.isFiltered,toggleFilter: this.toggleFilter, buttonLabel: "Inject Outgoing"})
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
		return MatcherButton({isFiltered: this.isFiltered,toggleFilter: this.toggleFilter, buttonLabel: "Log Incoming"})
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
		return MatcherButton({isFiltered: this.isFiltered,toggleFilter: this.toggleFilter, buttonLabel: "Log Outgoing"})
	}
})

var MatcherConfigElement = React.createClass({
	render: function() {
		if (this.props.matcher) {
			return React.DOM.div(null,
				React.DOM.div(null,
					MatcherFilterIncomingButton({matcher: this.props.matcher}),
					MatcherFilterOutgoingButton({matcher: this.props.matcher})
				),
				React.DOM.div(null,
					MatcherInjectIncomingButton({matcher: this.props.matcher}),
					MatcherInjectOutgoingButton({matcher: this.props.matcher})
				),
				React.DOM.div(null,
					MatcherLoggerIncomingButton({matcher: this.props.matcher}),
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
	render: function() {
		var packetList = [];
		if (this.state.matches) {
			this.state.matches.forEach(function(joinPoint) {
				packetList.push(CapturedPacketElement({joinPoint: joinPoint}));
			})
		}
		return React.DOM.div(null, packetList);
	}
});

var CapturedPacketElement = React.createClass({
	render: function() {
		return React.DOM.div(null,this.props.joinPoint.target.getSubject());
	}
});

function DamJSMatcher(matchString) {
	this.joinPointsCached = [];
	this.matchString = matchString;
	this.reacts = [];
	this.filterIncoming = false;
	this.filterOutgoing = false;
	this.injectIncoming = false;
	this.injectOutgoing = false;
	this.logIncoming = false;
	this.logOutgoing = false;;
	this.incomingInjectionFields = [{fieldValue: "", keyValue: ""}];
	this.outgoingInjectionFields = [{fieldValue: "", keyValue: ""}];
}

DamJSMatcher.prototype = {
	setReact: function(listener) {
		this.reacts.push(listener)
		this.updateReact();
	},
	clearReact: function(listener) {
		var listenerIndex = this.reacts.indexOf(listener);
		if (listenerIndex) {
			this.reacts.slice(listenerIndex,1);
		}
	},
	updateReact: function() {
		this.reacts.forEach(function(react) {
			react.setState({matches: this.joinPointsCached});
			react.setState({incomingInjectionFields: this.incomingInjectionFields});
			react.setState({outgoingInjectionFields: this.outgoingInjectionFields});
		}.bind(this))
	},
	toggleIncomingFilter: function() {
		this.filterIncoming = !this.filterIncoming;
		return this.filterIncoming;
	},
	toggleOutgoingFilter: function() {
		this.filterOutgoing = !this.filterOutgoing;
		return this.filterOutgoing;
	},
	isIncomingFiltered: function() {
		return this.filterIncoming;
	},
	isOutgoingFiltered: function() {
		return this.filterOutgoing;
	},
	toggleIncomingInjection: function() {
		this.injectIncoming = !this.injectIncoming;
		return this.injectIncoming;
	},
	toggleOutgoingInjection: function() {
		this.injectOutgoing = !this.injectOutgoing;
		return this.injectOutgoing;
	},
	isIncomingInjected: function() {
		return this.injectIncoming;
	},
	isOutgoingInjected: function() {
		return this.injectOutgoing;
	},
	toggleIncomingLogging: function() {
		this.logIncoming = !this.logIncoming;
		return this.logIncoming;
	},
	toggleOutgoingLogging: function() {
		this.logOutgoing = !this.logOutgoing;
		return this.logOutgoing;
	},
	isIncomingLogged: function() {
		return this.logIncoming;
	},
	isOutgoingLogged: function() {
		return this.logOutgoing;
	},
	addIncomingInjectionField: function() {
		this.incomingInjectionFields.push({});
		this.updateReact();
	},
	addOutgoingInjectionField: function() {
		this.outgoingInjectionFields.push({});
		this.updateReact();
	},
	updateIncomingInjectionField: function(row, value) {
		this.incomingInjectionFields[row].fieldValue = value;
		this.updateReact();
	},
	updateIncomingInjectionValue: function(row, value) {
		this.incomingInjectionFields[row].keyValue = value;
		this.updateReact();
	},
	updateOutgoingInjectionField: function(row, value) {
		this.outgoingInjectionFields[row].fieldValue = value;
		this.updateReact();
	},
	updateOutgoingInjectionValue: function(row, value) {
		this.outgoingInjectionFields[row].keyValue = value;
		this.updateReact();
	},
	matches: function(joinPoint) {
		if (joinPoint.target.getSubject().match(this.matchString)) {
			return true;
		}
		return false;
	},
	addJoinPoint: function(joinPoint) {
		this.joinPointsCached.push(joinPoint);
		this.updateReact();
	}
}

function DamJS(meld) {
	this.matchers = [];
	this.setListeners(meld);
	this.react = null;
}

DamJS.prototype = {
	setReact: function(react) {
		this.react = react;
		this.updateReact();
	},
	clearReact: function() {
		this.react = null;
	},
	updateReact: function() {

	},
	addNewMatcher: function(matchString) {
		this.matchers.push(new DamJSMatcher(matchString));
		this.update();
	},
	update: function() {
		if (this.listener) {
			this.listener();
		}
	},
	onUpdate: function(fn) {
		this.listener = fn;
	},
	handleUpdate: function(joinPoint) {
		this.matchers.forEach(function(matcher) {
			if (matcher.matches(joinPoint) && matcher.filterIncoming) {
				matcher.addJoinPoint(joinPoint);
			}
		}.bind(this))
		joinPoint.proceed();
	},
	setListeners: function(meld) {
		if (typeof caplin !== "undefined" && typeof caplin.streamlink !== "undefined") {
			meld.around(
				caplin.streamlink.impl.subscription.SubscriptionManager.prototype, 'send', function(joinPoint) {
					joinPoint.proceed();
				}.bind(this));

			meld.around(
				caplin.streamlink.impl.StreamLinkCoreImpl.prototype, 'publishToSubject', function(joinPoint) {
					//debugger;
				}.bind(this));
			meld.around(
				caplin.streamlink.impl.event.RecordType1EventImpl.prototype, '_publishSubscriptionResponse', function(joinPoint) {
					this.handleUpdate(joinPoint);
				}.bind(this)
			)
		}

	}
}

var damJS = new DamJS(module.exports);
damJS.addNewMatcher("/FX/EURUSD");
damJS.addNewMatcher("/FX/GBPUSD");
damJS.addNewMatcher("/FX/USDJPY");

var newElement = document.createElement('div');
document.body.appendChild(newElement);
React.renderComponent(DamJSElement({damJS: damJS}), newElement);