var CommonWidget = {

    render: function (ctx, tmpId, data) {
        ctx.template = Handlebars.compile($(tmpId).html());
        ctx.$ = $(ctx.template(data || {}));
    }
};