// CloudFront Function (cloudfront-js-2.0), viewer-request.
// The S3 origin is private behind OAC, so CloudFront only resolves "/" to index.html.
// Map extensionless paths to the .html objects Astro emits (build.format = "file").
function handler(event) {
  var request = event.request;
  var uri = request.uri;

  if (uri.length > 1 && uri.endsWith("/")) {
    uri = uri.slice(0, -1);
  }
  if (uri === "" || uri === "/") {
    request.uri = "/";
    return request;
  }

  var last = uri.slice(uri.lastIndexOf("/") + 1);
  request.uri = last.indexOf(".") === -1 ? uri + ".html" : uri;
  return request;
}
