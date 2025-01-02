"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ItemRarity = exports.ItemType = exports.AchievementCategory = void 0;
var AchievementCategory;
(function (AchievementCategory) {
    AchievementCategory["DAILY"] = "daily";
    AchievementCategory["WEEKLY"] = "weekly";
    AchievementCategory["MONTHLY"] = "monthly";
    AchievementCategory["SPECIAL"] = "special";
    AchievementCategory["MILESTONE"] = "milestone";
    AchievementCategory["SEASONAL"] = "seasonal";
})(AchievementCategory || (exports.AchievementCategory = AchievementCategory = {}));
var ItemType;
(function (ItemType) {
    ItemType["BADGE"] = "badge";
    ItemType["AVATAR"] = "avatar";
    ItemType["THEME"] = "theme";
    ItemType["EMOJI"] = "emoji";
    ItemType["TITLE"] = "title";
    ItemType["FEATURE"] = "feature";
})(ItemType || (exports.ItemType = ItemType = {}));
var ItemRarity;
(function (ItemRarity) {
    ItemRarity["COMMON"] = "common";
    ItemRarity["RARE"] = "rare";
    ItemRarity["EPIC"] = "epic";
    ItemRarity["LEGENDARY"] = "legendary";
})(ItemRarity || (exports.ItemRarity = ItemRarity = {}));
//# sourceMappingURL=rewards.enum.js.map