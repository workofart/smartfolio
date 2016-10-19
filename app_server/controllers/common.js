var apiOptions = {
    server: "http://localhost:3000"
};

var sendJsonResponse = function (res, status, content){
    res.status(status);
    res.json(content);
}