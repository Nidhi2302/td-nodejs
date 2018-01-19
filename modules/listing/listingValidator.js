let validator = {};
validator.getlistingValidator = (req, type) => {
    let input = {
        listASpace: {
                location: ["notEmpty","Location " +req.t("REQUIRE")],
                address: ["notEmpty","Address" + req.t("REQUIRE")],
                available:["notEmpty","Available "+req.t("REQUIRE")],
                description:["notEmpty","Description "+ req.t("REQUIRE")],
                max_vehicle_size:["notEmpty","Max_vehicle_size " +req.t("REQUIRE")],
            },
            findASpace:{
                lat:["notEmpty","lat " +req.t("REQUIRE")],
                lng:["notEmpty","lng " +req.t("REQUIRE")],
                radius:["notEmpty","radius " +req.t("REQUIRE")]
            }
        };
        return input[type];
}

module.exports = validator;

