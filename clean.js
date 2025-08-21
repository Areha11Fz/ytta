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

                    if (voucherDetails) {
                        const { voucher_identifier, reward_info, time_info, quota_info } = voucherDetails;

                        // Skip invalid vouchers
                        if (
                            !reward_info.percentage || // null, undefined, or 0
                            (quota_info && (
                                quota_info.fully_used === true ||
                                quota_info.fully_redeemed === true ||
                                quota_info.disabled === true
                            ))
                        ) {
                            continue;
                        }

                        const cleanedVoucher = {
                            start_time: time_info.start_time,
                            claim_start_time: time_info.claim_start_time,
                            voucher_code: voucher_identifier.voucher_code,
                            min_spend: reward_info.min_spend,
                            percentage: reward_info.percentage,
                            cap: reward_info.cap,
                            link: `https://shopee.co.id/voucher/details?&evcode=ytta&from_source=ytta&promotionId=${voucher_identifier.promotion_id}&signature=${voucher_identifier.signature}`,
                            promotion_id: voucher_identifier.promotion_id,
                            signature: voucher_identifier.signature,
                            claim_end_time: time_info.claim_end_time,
                            end_time: time_info.end_time,
                            has_expired: time_info.has_expired,
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
fs.writeFileSync('cleaned_vouchers.json', JSON.stringify(cleanedVouchers, null, 2));

console.log('Successfully cleaned data and saved to cleaned_vouchers.json');
