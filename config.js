module.exports = {
  realm_id: 7,
  owner_id:13,
  savvy_api_url:'https://www.savvyplatform.com/api-v1',
  notify_emails: [],
  subject: "single title #5",
  content: {
    html: "<p>start a project</p>",
    json:{
      creative: {
        type: "SINGLE_TITLE",
        platform: "facebook",
        width: 1280,
        height: 800,
        assets: [{
          name: "key art",
          url: "https://"
        }, {
          name: "title",
          url: "https://"
        }],
        text_values: [{
          ref: "end card message",
          value: "First Month Free"
        }, {
          ref: "Netflix",
          value: "Netflix"
        }],
        options: [{
          option: "show topper",
          value: "false"
        }, {
          option: "end card color",
          value: "white"
        }]
      }
    }
  }
}