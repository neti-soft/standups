var Viewport = function () {
    CommonWidget.render(this, '#viewport-tpl', null);
    this.$mainSection = this.$.find('#main');
    this.$settingsSection = this.$.find('#settings');
    $('body').append(this.$);
};

Viewport.prototype.showMain = function () {
    this.$mainSection.show();
    this.$settingsSection.hide();
};

Viewport.prototype.showOptions = function () {
    this.$mainSection.hide();
    this.$settingsSection.show();
};
