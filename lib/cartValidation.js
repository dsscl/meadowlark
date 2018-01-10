// 中间件更常见的做法是：模块输出一个以中间件为属性的对象
module.exports = {
    checkWaivers: function(req, res, next) {
        var cart = req.session.cart;
        if(!cart) {
            return next();
        }
        if(cart.some(function(item) { return item.product.requiresWaiver; })) {
            if(!cart.warnings) {
                cart.warnings = [];
                cart.warnings.push('One or more of your selected tours requires a waiver.');
            }
            next();
        }
    },
    checkGuestCounts: function(req, res, next) {
        var cart = req.session.cart;
        if(!cart) {
            return next();
        }
        if(cart.some(function(item) { return item.product.guests > item.product.maxinumGuests; })) {
            if(!cart.errors) {
                cart.errors = [];
                cart.errors.push('One or more of your selected tours cannot accommodate the number of guests you have selected.');
            }
            next();
        }
    }
}