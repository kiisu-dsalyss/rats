exports.parseTransportResponse = (responseBody) => {
  const values = responseBody.split('\t');
  return {
    time: values[2],
    measure: values[4],
    playing: values[1]
  };
}

exports.endpoint = '/_/TRANSPORT';
