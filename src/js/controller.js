var Controller = {
    init: function () {
        this.vp = new Viewport();
        this.vp.showMain();
    }
}

document.addEventListener('DOMContentLoaded', function () {
    Controller.init();
});