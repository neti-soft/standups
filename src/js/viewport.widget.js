var Viewport = function () {
    this.template = Handlebars.compile($('#viewport-tpl').html());
    this.$ = $(this.template());
    this.$mainSection = this.$.find('.main');
    this.$optionsSection = this.$.find('.options');
    $('body').append(this.$);
};

Viewport.prototype.showMain = function () {
    this.$mainSection.show();
    this.$optionsSection.hide();
};

Viewport.prototype.showOptions = function () {
    this.$mainSection.hide();
    this.$optionsSection.show();
};