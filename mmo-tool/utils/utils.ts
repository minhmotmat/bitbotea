

export function sample (arr: any) {
    return arr[Math.floor((Math.random() * arr.length))]
}
export function getRandom(num: any, random: any) {
    return num + sample([-1, 1]) * Math.floor(random * Math.random());
}


export function getRandomInt (min: number, max: number) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

const createDistribution = (weights: number[], size: number) => {
    const distribution = [];
    const sum = weights.reduce((a, b) => a + b);
    const quant = size / sum;
    for (let i = 0; i < weights.length; ++i) {
        const limit = quant * weights[i];
        for (let j = 0; j < limit; ++j) {
            distribution.push(i);
        }
    }
    return distribution;
};

const randomIndex = (distribution: number[]) => {
    const index = Math.floor(distribution.length * Math.random());  // random index
    return distribution[index];
};

const randomItem = (array: any[], distribution: number[]) => {
    const index = randomIndex(distribution);
    return array[index];
};

export function getRandomWeights (array: any[], weights: number[]) {
    const distribution = createDistribution(weights, 10);
    return randomItem(array, distribution);
}
export  async function waitFor (milliseconds: number) {
    await new Promise(r => setTimeout(r, milliseconds));
}
