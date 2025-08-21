const fs = require('fs');

// Read the raw vouchers data from the JSON file
const vouchers = JSON.parse(fs.readFileSync('vouchers.json', 'utf-8'));

let cleanedVouchers = {};

// Loop through each main key in the vouchers object (e.g., "12972580616")
for (const [collectionId, collectionData] of Object.entries(vouchers)) {

    // Initialize an array to hold the cleaned vouchers for this collection
    cleanedVouchers[collectionId] = [];

    // Navigate through the nested structure to find the vouchers array
    if (collectionData && collectionData.data && Array.isArray(collectionData.data)) {
        for (const item of collectionData.data) {
            if (item && item.vouchers && Array.isArray(item.vouchers)) {

                // Loop through each voucher in the collection
                for (const voucherWrapper of item.vouchers) {
                    const voucherDetails = voucherWrapper.voucher;

                    // Proceed if the main voucher detail object exists
                    if (voucherDetails) {
                        const voucherCode = voucherDetails.voucher_identifier.voucher_code;
                        const promotionId = voucherDetails.voucher_identifier.promotion_id;
                        const signature = voucherDetails.voucher_identifier.signature;

                        // Create a new object with only the required fields
                        const cleanedVoucher = {
                            start_time: voucherDetails.time_info.start_time,
                            claim_start_time: voucherDetails.time_info.claim_start_time,
                            voucher_code: voucherCode,
                            min_spend: voucherDetails.reward_info.min_spend,
                            percentage: voucherDetails.reward_info.percentage,
                            cap: voucherDetails.reward_info.cap,
                            link: `https://shopee.co.id/voucher/details?&evcode=ytta&from_source=ytta&promotionId=${promotionId}&signature=${signature}`,
                            promotion_id: promotionId,
                            signature: signature,
                            claim_end_time: voucherDetails.time_info.claim_end_time,
                            end_time: voucherDetails.time_info.end_time,
                            has_expired: voucherDetails.time_info.has_expired,
                        };

                        // Add the cleaned voucher object to its collection array
                        cleanedVouchers[collectionId].push(cleanedVoucher);
                    }
                }
            }
        }
    }
}

// Write the final cleanedVouchers object to a new JSON file
// The 'null, 2' argument formats the JSON for better readability (2-space indentation)
fs.writeFileSync('cleaned_vouchers.json', JSON.stringify(cleanedVouchers, null, 2));

console.log('Successfully cleaned data and saved to cleaned_vouchers.json');