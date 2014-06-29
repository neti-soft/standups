var CommonWidget = {

    render: function (ctx, tmpId, data) {
        ctx.template = Handlebars.compile($(tmpId).html());
        ctx.$ = $(ctx.template(data || {}));
    },

    events: function (el, ctx) {
        el = el  instanceof jQuery ? el.get(0) : el;

        function walk(node, walker) {
            if (node.nodeType === 1 && node.nodeType !== 3) walker(node);
            node = node.firstChild;
            while (node) {
                walk(node, walker);
                node = node.nextSibling;
            }
        }

        walk(el, function (node) {
            for (var p in node.dataset) {
                var fnName = node.dataset[p];
                if (ctx[fnName]) $(node).on(p, ctx[fnName].bind(ctx));
            }
        });
    }
};
