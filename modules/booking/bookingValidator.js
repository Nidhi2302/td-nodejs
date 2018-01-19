let validator = {};
validator.getBookingValidator = (req, type) => {
    let input = {
            bookASpace:{
                listingId:["notEmpty", "ListingID "+req.t("REQUIRE")],
                listedUserId:["notEmpty", "ListedUserId "+req.t("REQUIRE")]
            }
        };
        return input[type];
}

module.exports = validator;

