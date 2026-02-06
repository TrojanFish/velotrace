export interface CommonTorque {
    component: string;
    standard: string;
}

export const COMMON_TORQUES: CommonTorque[] = [
    { component: "把立把横盖 (Stem Faceplate)", standard: "5.0 Nm" },
    { component: "把立舵管锁死 (Stem Steerer Bolt)", standard: "5.0 - 6.0 Nm" },
    { component: "座管夹 (Seatpost Clamp)", standard: "5.0 - 7.0 Nm" },
    { component: "手变夹环 (Shift/Brake Lever)", standard: "6.0 - 8.0 Nm" },
    { component: "锁鞋锁片 (Cleat Bolts)", standard: "5.0 - 6.0 Nm" },
    { component: "夹器安装螺丝 (Caliper Mounting)", standard: "6.0 - 8.0 Nm" },
    { component: "曲轴盖 (Crank Arm Cap)", standard: "0.7 - 1.5 Nm" },
    { component: "水壶架 (Bottle Cage)", standard: "3.0 Nm" },
    { component: "后拨挂钩 (Derailleur Hanger)", standard: "8.0 - 10.0 Nm" },
];
