/**
 * ETH trafega como string decimal ("1.19"). Toda aritmética é feita em wei (bigint, 18 casas),
 * então não há erro de ponto flutuante. Regras puras, sem libs.
 */
export type EthString = string;

export const ETH_DECIMALS = 18;
const WEI_PER_ETH = 10n ** 18n;
const ETH_PATTERN = /^\d+(\.\d{1,18})?$/;

export function isEthString(value: string): boolean {
  return ETH_PATTERN.test(value);
}

export function ethToWei(value: EthString): bigint {
  if (!isEthString(value)) throw new RangeError(`Valor ETH inválido: "${value}"`);
  const [whole, fraction = ""] = value.split(".");
  return BigInt(whole) * WEI_PER_ETH + BigInt(fraction.padEnd(ETH_DECIMALS, "0"));
}

export function weiToEth(wei: bigint): EthString {
  if (wei < 0n) throw new RangeError("Valor ETH não pode ser negativo");
  const whole = wei / WEI_PER_ETH;
  const fraction = (wei % WEI_PER_ETH).toString().padStart(ETH_DECIMALS, "0").replace(/0+$/, "");
  return fraction ? `${whole}.${fraction}` : `${whole}`;
}

export function addEth(a: EthString, b: EthString): EthString {
  return weiToEth(ethToWei(a) + ethToWei(b));
}

export function subEth(a: EthString, b: EthString): EthString {
  return weiToEth(ethToWei(a) - ethToWei(b));
}

export function sumEth(values: readonly EthString[]): EthString {
  return weiToEth(values.reduce((acc, v) => acc + ethToWei(v), 0n));
}

export function mulEthByInt(value: EthString, quantity: number): EthString {
  if (!Number.isInteger(quantity) || quantity < 0) {
    throw new RangeError(`Quantidade deve ser inteira e não negativa: ${quantity}`);
  }
  return weiToEth(ethToWei(value) * BigInt(quantity));
}

export function percentOfEth(value: EthString, basisPoints: number): EthString {
  if (!Number.isInteger(basisPoints) || basisPoints < 0) {
    throw new RangeError(`basisPoints deve ser inteiro e não negativo: ${basisPoints}`);
  }
  return weiToEth((ethToWei(value) * BigInt(basisPoints)) / 10_000n);
}

export function compareEth(a: EthString, b: EthString): -1 | 0 | 1 {
  const x = ethToWei(a);
  const y = ethToWei(b);
  return x === y ? 0 : x < y ? -1 : 1;
}

export function formatEth(value: EthString, minFractionDigits = 2): string {
  const [whole, fraction = ""] = weiToEth(ethToWei(value)).split(".");
  const padded = fraction.padEnd(minFractionDigits, "0");
  return padded ? `${whole}.${padded}` : whole;
}
