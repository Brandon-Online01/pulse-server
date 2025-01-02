"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.calculateXP = calculateXP;
function calculateXP(hours, tasks, sales) {
    return Math.round((hours * 10) + (tasks * 5) + (sales * 0.01));
}
//# sourceMappingURL=xp.utils.js.map