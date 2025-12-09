import { buildSalesQuery } from "../utils/queryBuilder.js";

export function getSales(data, queryParams) {
  return buildSalesQuery(data, queryParams);
}
