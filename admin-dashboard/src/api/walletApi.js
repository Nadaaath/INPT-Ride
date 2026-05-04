import api from "./axios";

export async function topUpWallet({ userId, amount }) {
  const response = await api.post("/wallet/top-up/", {
    user_id: userId,
    amount,
  });

  return response.data;
}