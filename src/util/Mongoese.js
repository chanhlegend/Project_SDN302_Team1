module.exports = {
    mutipleMongoeseToObject: function (mongooeses) {
        return mongooeses.map(mongooese => mongooese.toObject())
    },
    mongoeseToObject: function (mongooese) {
        return mongooese ? mongooese.toObject() : mongooese
    }
}