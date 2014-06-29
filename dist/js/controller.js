var Controller = {

    init: function () {
        this.vp = new Viewport();
        this.vp.showMain();
        this.opts = new Opts();
    },

    toggleVolume: function () {
        alert('volume toggle');
    }
}

document.addEventListener('DOMContentLoaded', Controller.init);
