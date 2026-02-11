export interface FuelProduct {
    id: string;
    name: string;
    brand: string;
    carbs: number; // grams
    sodium?: number; // mg
    caffeine?: number; // mg
    type: 'gel' | 'bar' | 'drink' | 'salt-pill' | 'other';
    unit: string;
}

export const FUEL_PRODUCTS: FuelProduct[] = [
    { id: 'sis-gel', name: 'SiS GO Isotonic Gel', brand: 'SiS', carbs: 22, type: 'gel', unit: '支' },
    { id: 'sis-beta-gel', name: 'SiS Beta Fuel Gel', brand: 'SiS', carbs: 40, type: 'gel', unit: '支' },
    { id: 'maurten-100', name: 'Maurten Gel 100', brand: 'Maurten', carbs: 25, type: 'gel', unit: '支' },
    { id: 'maurten-160', name: 'Maurten Gel 160', brand: 'Maurten', carbs: 40, type: 'gel', unit: '支' },
    { id: 'precision-30', name: 'PF 30 Gel', brand: 'Precision', carbs: 30, type: 'gel', unit: '支' },
    { id: 'precision-90', name: 'PF 90 Gel', brand: 'Precision', carbs: 90, type: 'gel', unit: '支' },
    { id: 'gu-gel', name: 'GU Energy Gel', brand: 'GU', carbs: 22, type: 'gel', unit: '支' },
    { id: 'salt-pill', name: '电解质盐丸', brand: 'Generic', carbs: 0, sodium: 250, type: 'salt-pill', unit: '颗' },
    { id: 'drink-mix-40', name: '标准运动饮料 (单瓶)', brand: 'Generic', carbs: 40, type: 'drink', unit: '瓶' },
    { id: 'drink-mix-80', name: '高能运动饮料 (Beta)', brand: 'Generic', carbs: 80, type: 'drink', unit: '瓶' },
];
