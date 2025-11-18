import axios from "axios";

const clientId = process.env.SFMC_CLIENT_ID;
const clientSecret = process.env.SFMC_CLIENT_SECRET;
const authUrl = "https://mc78k1p8lr42d-wv47vyss3p8z04.auth.marketingcloudapis.com/v2/token";
const restUrl = "https://mc78k1p8lr42d-wv47vyss3p8z04.rest.marketingcloudapis.com";

export async function getAccessToken() {
  const response = await axios.post(authUrl, {
    grant_type: "client_credentials",
    client_id: clientId,
    client_secret: clientSecret,
  });
  return response.data.access_token;
}

export async function addSubscriberToSFMC(user) {
  const token = await getAccessToken();
  console.log("🔑 Access Token fetched successfully");

  // ✅ Match Postman payload format
  const subscriberData = [
    {
      keys: { SubscriberKey: user.email },
      values: {
        EmailAddress: user.email,
        FirstName: user.firstName,
        LastName: user.lastName,
        PhoneNumber: user.phone || "", // optional field
      },
    },
  ];

  const url = `${restUrl}/hub/v1/dataevents/key:${process.env.DE_EXTERNAL_KEY}/rowset`;

  try {
    const response = await axios.post(url, subscriberData, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    console.log("✅ Subscriber added/updated successfully in SFMC!");
    return response.data;
  } catch (error) {
    console.error("❌ Error adding subscriber to SFMC:", error.response?.data || error.message);
    throw error;
  }
}
