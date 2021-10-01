var axios = require('axios')


var listOfImageURLS = []; // Stores all of the image URL's we want to return
var filesToReturn = 20;

/* VARIABLES TO CHANGE */
const store = "bitossi"; // Change this
const api_token = ""; // Add your token here



const headers = {
  "X-Shopify-Access-Token" : api_token,
  "Content-Type" : "application/json"
};
const url = `https://${store}.myshopify.com/admin/api/2021-07/graphql.json`;

async function getAllImages(limit, cursor) {
    var parameters = `first: ${limit}`;
    if (cursor) { parameters += `, after:${cursor}`};

    var query = `query {
       files(${parameters}) {
          edges {
            node {
              ... on GenericFile {
                url
              }
              ... on MediaImage {
                image {
                  transformedSrc
                }
              }
            }
            cursor
          }
        pageInfo {
          hasNextPage
        }
        }
      }
    `;

    const response = await axios({
      method : 'post',
      url : url,
      headers : headers,
      data : JSON.stringify({query})
    }).then(function(resp) {
      if (resp.data.errors) {
        console.log("Error: ", resp.data.errors[0].message);
        // console.log("Error Headings: ", resp.headers)
      } else {
        var edges = resp.data.data.files.edges;
        edges.forEach(function(node){ // Push URLS
          let url = node.node.url ? node.node.url : node.node.image.transformedSrc;
          listOfImageURLS.push(url)
        });


        if (resp.data.data.files.pageInfo.hasNextPage) {
          let cursor = `"${edges[edges.length - 1]["cursor"]}"`; // Get the last elements' cursor
          getAllImages(filesToReturn, cursor )
        } else {
          console.log(listOfImageURLS);
          console.log("Total Images: ", listOfImageURLS.length);
        }
      }
    }).catch(function(e) {
      console.log(e);
    });
};

getAllImages(filesToReturn, null); // Kick Off
