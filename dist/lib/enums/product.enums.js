"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ResellerStatus = exports.ProductStatus = void 0;
var ProductStatus;
(function (ProductStatus) {
    ProductStatus["ACTIVE"] = "active";
    ProductStatus["INACTIVE"] = "inactive";
    ProductStatus["HIDDEN"] = "hidden";
    ProductStatus["SPECIAL"] = "special";
    ProductStatus["NEW"] = "new";
    ProductStatus["DISCONTINUED"] = "discontinued";
    ProductStatus["BEST_SELLER"] = "bestseller";
    ProductStatus["HOTDEALS"] = "hotdeals";
    ProductStatus["OUTOFSTOCK"] = "outofstock";
})(ProductStatus || (exports.ProductStatus = ProductStatus = {}));
var ResellerStatus;
(function (ResellerStatus) {
    ResellerStatus["ACTIVE"] = "active";
    ResellerStatus["INACTIVE"] = "inactive";
})(ResellerStatus || (exports.ResellerStatus = ResellerStatus = {}));
//# sourceMappingURL=product.enums.js.map