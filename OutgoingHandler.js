var OutgoingHandler = function(ko) {
    this.ko = ko; //KO must be passed in, as different version may already be on page
    this.newMatcherText = this.ko.observable("/FX/EURUSD/SPOT/EUR/500");
    this.matchers = this.ko.observableArray();
    this.subscriptionsCalled = this.ko.observableArray();
    this.interceptedData = this.ko.observableArray();
    var self = this;
}

OutgoingHandler.prototype.addNewMatcher = function() {
    return this._addMatcher(this.newMatcherText());
}

OutgoingHandler.prototype._addMatcher = function(subscription) {
    var matcher = {
        matcher: subscription,
        outFilter: this.ko.observable(false),
        inFilter: this.ko.observable(false)
    }
    this.matchers.push(matcher);
    return matcher
}

OutgoingHandler.prototype.copySubscriptionToMatcher = function(self, subscription) {
    //Architecture of KO prevents knowing object when method invoked
    self._addMatcher(subscription.args[0].getSubject());
}

OutgoingHandler.prototype.onSubscribe = function(joinPoint) {
    this.subscriptionsCalled.push(joinPoint);

    var subject = joinPoint.args[0].getSubject();
    var filtered = false;
    this.matchers().forEach(function(matcher){
        if (matcher.outFilter() && subject === matcher.matcher) filtered = true;
    });
    if (!filtered) {
        return joinPoint.proceed();
    }
}

OutgoingHandler.prototype.onData = function(joinPoint) {
    var subject = joinPoint.target.getSubject();
    var filtered = false;
    this.matchers().forEach(function(matcher){
        if (matcher.inFilter() && subject === matcher.matcher) {
            filtered = true;
            joinPoint.damFields = ko.computed(function() {
                var fieldArray = [];
                var fieldsMap = joinPoint.target.getFields();
                for (var key in fieldsMap) {
                    fieldArray.push({key: key, value: fieldsMap[key]});
                }
                return fieldArray;
            });
            this.interceptedData.push(joinPoint);
        }
    }.bind(this));
    if (!filtered) {
        return joinPoint.proceed();
    }
}

OutgoingHandler.prototype.forwardInterceptedData = function(self, data) {
    data.proceed();
    self.interceptedData.remove(data);
}