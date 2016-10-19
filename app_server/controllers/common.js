var apiOptions = {
    server: "http://localhost:3000"
};
module.exports.apiOptions = apiOptions;

var sendJsonResponse = function (res, status, content){
    res.status(status);
    res.json(content);
}
module.exports.sendJsonResponse = sendJsonResponse;