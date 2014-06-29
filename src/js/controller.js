var Controller = {
    init: function () {
        this.vp = new Viewport();
        this.vp.showMain();
        this.opts = new Opts();
    }
}

document.addEventListener('DOMContentLoaded', Controller.init);
