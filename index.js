const fs = require('fs')
const request = require('request-promise-native')
const config = require('./config')
const chalk = require('chalk');
//const supportingTicket = require('./tasks/supporting-ticket')

let ticket={},ticket_state={};
let yargs = require("yargs")
.command("createTicket", "create a supporting ticket", function (yargs) {
  createTicket();
}).command("createPost", "create a supporting post", function (yargs) {
  createPost(yargs.argv.ticketId);
  yargs.option('ticketId', {
    demandOption: true,
    describe: 'ticket id'
  })
}).command("ticketState", "check supporting ticket's state", function (yargs) {
  checkTicketState(yargs.argv.ticketId);
  yargs.option('ticketId', {
    demandOption: true,
    describe: 'ticket id'
  })
}).command("postState", "check supporting post's state", function (yargs) {
  checkPostState(yargs.argv.ticketId);
  yargs.option('ticketId', {
    demandOption: true,
    describe: 'ticket id'
  })
}).option('token', {
  demandOption: true,
  describe: 'access token'
});

yargs.help().argv;
if (yargs.argv._[0] === undefined) {
  yargs.showHelp();
}

async function createTicket(){
  //console.log(`${config.savvy_api_url}/supporting_tickets`,);
  try{
    const result = await request.post({
      uri: `${config.savvy_api_url}/supporting_tickets`,
      headers: {
        'authorization': `Bearer ${yargs.argv.token}`,
        'Content-Type' : 'application/json'
      },
      body:{
        subject: config.subject,
        content: config.content,
        realm_id: config.realm_id,
        notify_emails: config.notify_emails
      },
      json: true
    });
    ticket = result;
    //console.log(ticket);
    console.log(chalk.green('ticket create succeed!'));
    checkTicketState();
  }catch(e){
    if (!e.error || !e.error.error) throw e
    const err = e.error.error
    if (err.name === 'conflict_error'){
      console.warn(`use existing creative: ${err.conflict_id}`)
      ticket.id = err.conflict_id
    }else{
      console.log(err)
      return ticket
    }
  }
  
}

async function createPost(ticketId){
  //console.log(`${config.savvy_api_url}/supporting_tickets/`,);
  try{
    const result = await request.post({
      uri: `${config.savvy_api_url}/supporting_posts`,
      headers: {
        'authorization': `Bearer ${yargs.argv.token}`,
        'Content-Type' : 'application/json'
      },
      body:{
        subject: config.subject,
        content: config.content,
        realm_id: config.realm_id,
        ticket_id: ticketId ? ticketId:ticket.id,
        owner_id: config.owner_id
      },
      json: true
    });
    let post = result;
    //console.log('post',post);
    console.log(chalk.green('post create succeed!'));
  }catch(e){
    console.log(e.error.error)
  }
}

function checkTicketState(ticketId) { 
  const checker = async () => {
    //console.log(`${config.savvy_api_url}/supporting_tickets/limit=5&skip=0`);
    const result = await request.get({
      uri: `${config.savvy_api_url}/supporting_tickets`,
      qs:{
        limit: 5,
        skip: 0,
        sort:'id',
        filter: JSON.stringify({'id':ticketId ? ticketId:ticket.id})
      },
      headers: {
        'authorization': `Bearer ${yargs.argv.token}`
      },
      json: true
    })
    
    //console.log(`ticket state:`, result)
    ticket_state = result.records[0];
    if (ticket_state.state === 'client_created') {
      setTimeout(checker, 5000);
      console.log(chalk.green('ticket waiting service reply'));
    } else {
      console.log(chalk.green('service replied!'));
      checkPostState(ticketId);
    }
  }
  //setTimeout(checker, 5000)
  checker()
}

function checkPostState(ticketId){
  const checker = async () => {
    //console.log(`${config.savvy_api_url}/supporting_tickets/limit=5&skip=0`);
    const result = await request.get({
      uri: `${config.savvy_api_url}/supporting_posts`,
      qs:{
        limit: 1,
        skip: 0,
        sort:'-updated_at',
        filter: JSON.stringify({'ticket_id':ticketId ? ticketId:ticket.id})
      },
      headers: {
        'authorization': `Bearer ${yargs.argv.token}`
      },
      json: true
    })
    
    //console.log(`post record:`, result)
    let post_state = result.records[0].content.json; 
    if (!post_state || !post_state.process_state || post_state.process_state && post_state.process_state !== 'failed' && post_state.process_state !== 'success') {
      setTimeout(checker, 5000);
      console.log(chalk.green('post state:',post_state&&post_state.process_state?post_state.process_state:'in_progress'));
    } else {
      //console.log('==end');
      if(post_state.process_state === 'failed'){
        console.log(chalk.red('ticket failed!'));
      }
      else{
        console.log(chalk.green(`ticket success!\nvideo link:${post_state.creative.video}\npreview link:${post_state.creative.preview}`));
      }
    }
  }
  checker()
}

