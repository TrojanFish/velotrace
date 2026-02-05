/**
 * Road Cycling Kit Advisor
 */

interface KitInput {
    temp: number; // °C
    apparentTemp: number; // °C (RealFeel/WindChill)
    isRainy: boolean;
    isColdRunner: boolean;
}

export function getKitRecommendation({
    temp: _temp,
    apparentTemp,
    isRainy,
    isColdRunner
}: KitInput) {
    // Use apparent temp as the primary driver for wind-chill consideration
    const effectiveTemp = isColdRunner ? apparentTemp - 3 : apparentTemp;

    let baseLayer = "无需排汗内衣";
    let jersey = "短袖车衣";
    let accessories: string[] = [];

    if (effectiveTemp > 25) {
        baseLayer = "极薄排汗衫";
        jersey = "爬坡款轻量车衣";
    } else if (effectiveTemp > 18) {
        baseLayer = "无袖内衣";
        accessories = ["根据下坡需要带马甲"];
    } else if (effectiveTemp > 12) {
        baseLayer = "短袖内衣";
        jersey = "长袖车衣 或 短袖+袖套";
        accessories = ["防风马甲"];
    } else if (effectiveTemp > 7) {
        baseLayer = "长袖内衣";
        jersey = "抓绒长袖车衣";
        accessories = ["防风马甲", "长指手套", "护膝/腿套"];
    } else {
        baseLayer = "加厚排汗衫";
        jersey = "防风冬季车服";
        accessories = ["冬季长指手套", "防风鞋套", "围脖"];
    }

    if (isRainy) {
        accessories.push("防水雨衣/皮肤衣");
    }

    return {
        baseLayer,
        jersey,
        accessories,
        level: effectiveTemp > 20 ? 'warm' : effectiveTemp > 10 ? 'cool' : 'cold'
    };
}
