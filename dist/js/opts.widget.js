var Opts = function () {
    CommonWidget.render(this, '#opts-tpl', null);
    $('#main header').append(this.$);
    CommonWidget.events(this.$, Controller);
}

Opts.prototype = {

}
