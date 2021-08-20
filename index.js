const Discord = require('discord.js');
const client = new Discord.Client()
const disbut = require('discord-buttons')
disbut(client)
const db = require('quick.db')
config = require('./config.json')
const figlet = require('figlet')
const chalk = require('chalk')
const token = config.token
const prefix = config.prefix
const description = config.description
const tdescription = config.tdescription

async function fetchTranscript(channel ,message, numberOfMessages) {
    if(!message) throw new ReferenceError('Transcript => "message" is not defined')
      if(!numberOfMessages) throw new ReferenceError('Transcript => "numberOfMessages" is not defined')
      if(typeof numberOfMessages !== "number") throw new SyntaxError('Transcript => typeof "numberOfMessages" must be a number')
      if(numberOfMessages >= 100) throw new RangeError('Transcript => "numberOfMessages" must be under 100 messages')
      const jsdom = require('jsdom');
      const fs = require('fs')
      const { JSDOM } = jsdom;
      const dom = new JSDOM();
      const document = dom.window.document;
      let messageCollection = new Discord.Collection();
      let channelMessages = await channel.messages.fetch({
          limit: numberOfMessages
      }).catch(err => console.log(err));
      messageCollection = messageCollection.concat(channelMessages);
  
      while(channelMessages.size === 100) {
          let lastMessageId = channelMessages.lastKey();
          channelMessages = await channel.messages.fetch({ limit: numberOfMessages, before: lastMessageId }).catch(err => console.log(err));
          if(channelMessages)
              messageCollection = messageCollection.concat(channelMessages);
      }
      let msgs = messageCollection.array().reverse();
      return new Promise(async(ful) => {
          await fs.readFile(require('path').join(__dirname, 'template.html'), 'utf8', async function(err, data) {
              if(data) {
                  await fs.writeFile(require('path').join(__dirname, 'index.html'), data, async function(err) {                if(err) return console.log(err) 
                      let info = document.createElement('div')
                      info.className =  'info';
                      let iconClass = document.createElement('div')
                      iconClass.className = 'info__guild-icon-container';
                      let guild__icon = document.createElement('img')
                      guild__icon.className = 'info__guild-icon'
                      guild__icon.setAttribute('src', message.guild.iconURL())
                      iconClass.appendChild(guild__icon)
                      info.appendChild(iconClass)
                      
                      let info__metadata = document.createElement('div')
                      info__metadata.className = 'info__metadata'
      
                      let guildName = document.createElement('div')
                      guildName.className = 'info__guild-name'
                      let gName = document.createTextNode(message.guild.name);
                      guildName.appendChild(gName)
                      info__metadata.appendChild(guildName)
                      let messagecount = document.createElement('div')
                      messagecount.className = 'info__channel-message-count'
                      messagecount.appendChild(document.createTextNode(`Transcripted ${channelMessages.size} messages From: ${channel.name}`))
                      info__metadata.appendChild(messagecount)
                      info.appendChild(info__metadata)
                      await fs.appendFile(require('path').join(__dirname, 'index.html'), info.outerHTML, async function(err) {
                          if(err) return console.log(err)
                          msgs.forEach(async msg => {
                              let parentContainer = document.createElement("div");
                              parentContainer.className = "parent-container";
                              let avatarDiv = document.createElement("div");
                              avatarDiv.className = "avatar-container";
                              let img = document.createElement('img');
                              img.setAttribute('src', msg.author.displayAvatarURL());
                              img.className = "avatar";
                              avatarDiv.appendChild(img);
              
                              parentContainer.appendChild(avatarDiv);
                              let messageContainer = document.createElement('div');
                              messageContainer.className = "message-container";
                              let nameElement = document.createElement("span");
                              let name = document.createTextNode(msg.author.tag + " " + msg.createdAt.toDateString() + " " + msg.createdAt.toLocaleTimeString() + " EST");
                              nameElement.appendChild(name);
                              messageContainer.append(nameElement);
              
                              if(msg.content.startsWith("```")) {
                                  let m = msg.content.replace(/```/g, "");
                                  let codeNode = document.createElement("code");
                                  let textNode =  document.createTextNode(m);
                                  codeNode.appendChild(textNode);
                                  messageContainer.appendChild(codeNode);
                              }
                              else {
                                  let msgNode = document.createElement('span');
                                  if (msg.attachments){
                                    
                                    const files = getImageLinks(msg.attachments);
                                    if (files[0] !== undefined){
                                        let img = document.createElement('img');
                                        img.setAttribute('src', files[0])
                                        messageContainer.appendChild(img)
                                    }
                                  } 
                                  
                                  if (msg.content){
                                  let textNode = document.createTextNode(msg.content);
                                  msgNode.append(textNode);
                                  messageContainer.appendChild(msgNode);
                                  }

                                  
                              }
                              parentContainer.appendChild(messageContainer);
                              await fs.appendFile(require('path').join(__dirname, 'index.html'), parentContainer.outerHTML, function(err) {
                                  if(err) return console.log(err)
                              })
                          });
                          fs.readFile(require('path').join(__dirname, 'index.html'), (err, data) => {
                              if(err) console.log(err)
                              ful(data)
                          })    
                      })
                  })
              }
          })
      })
  }

  function getImageLinks(attachments) {
    const valid = /^.*(gif|png|jpg|jpeg)$/g;
    return attachments.array().filter((attachment) => valid.test(attachment.url)).map((attachment) => attachment.url);
  }




client.on('ready', () => {
    console.log(chalk.green(figlet.textSync('TFC Ticket')))
    console.log(chalk.greenBright(`Logged In As ${client.user.tag}`))
    client.user.setPresence({
        status: 'online',
        activity: {
            name: 'TFC Ticket System',
            type: 'COMPETING'
        }
    })
})

client.on('message', msg => {
    if (msg.mentions.has(client.user.id)) {
        if (msg.content.includes('@everyone') || msg.content.includes('@here')) return
        msg.channel.send(`**I Am A Ticket Bot, Prefix: ${prefix}\n\nAll Copyrights Goes To TFC-Mahmoud**`)
    }
})

client.on('message', msg => {
    if (msg.content.startsWith(prefix + 'help')) {
    let embed = new Discord.MessageEmbed()
    .setTitle('TFC Ticket 🎫')
    .setDescription(`
    **__Commands🔒__**

    \`${prefix}ticket-setup\` , \`${prefix}reset-ticket\` , \`${prefix}delete\`


    `)
    .setThumbnail(msg.guild.iconURL())
    .setFooter(`All Copyrights For TFC Mahmoud |-| Prefix: ${prefix}`)
    .setColor('#6600ff')
    msg.channel.send(embed)
    }
})

client.on('message', msg => {
    if (msg.content === prefix + 'ticket-setup') {
        msg.delete()
        if (!msg.member.hasPermission('ADMINISTRATOR')) return msg.channel.send(`**You Do Not Have The Permission \`ADMINISTRATOR\` To Preform This Command!**`)
        let button = new disbut.MessageButton()
        .setStyle('blurple')
        .setLabel('Create New Ticket')
        .setEmoji('🎫')
        .setID('ticketadd')
        let embed = new Discord.MessageEmbed()
        .setTitle('Create New Ticket')
        .setThumbnail(msg.guild.iconURL())
        .setColor('BLUE')
        .setDescription(description)
        .setFooter(`All Copyrights For TFC Mahmoud |-| Prefix: ${prefix}`)
        const row = new disbut.MessageActionRow()//Copyrights For TFC Mahmoud
        .addComponent([button])
        msg.channel.send({
            component: row,
            embed: embed
        })
    }
})


client.on('clickButton', async button => {
    let ticketnum = db.fetch(`ticket_${button.guild.id}`) || '0'
    if (button.id === 'ticketadd') {
        db.add(`ticket_${button.guild.id}`, 1)
        let ticketnum2 = db.fetch(`ticket_${button.guild.id}`)
        button.defer()
        button.guild.channels.create(`ticket-${ticketnum2}`, {
			permissionOverwrites: [
				{
					id: button.clicker.user.id,
					allow: ['SEND_MESSAGES', 'VIEW_CHANNEL'],
				},
				{
					id: button.guild.roles.everyone,
					deny: ['VIEW_CHANNEL'],
				},
			],
			type: 'text',
		}).then(channel => {
            let mainbut = new disbut.MessageButton()
            .setStyle('blurple')
            .setLabel('Close Ticket')
            .setEmoji('🔒')
            .setID('ticketclose')
            let embed = new Discord.MessageEmbed()//Copyrights For TFC Mahmoud
            .setDescription(tdescription)
            .setColor('GREEN')
            .setFooter(`All Copyrights For TFC Mahmoud |-| Prefix: ${prefix}`)
            channel.send(`Hello <@${button.clicker.user.id}>,`, {
                buttons: [mainbut],
                embed: embed
            })
        })
    } else if (button.id === 'ticketclose') {
        button.defer()
        let embed = new Discord.MessageEmbed()
        .setColor('RED')
        .setDescription('**Ticket Is Closed**')
        .setFooter(`All Copyrights For TFC Mahmoud |-| Prefix: ${prefix}`)
        let button1 = new disbut.MessageButton()
        .setStyle('red')
        .setLabel('Delete Ticket')
        .setEmoji('❌')
        .setID('ticketdel')
        let button2 = new disbut.MessageButton()
        .setStyle('green')
        .setLabel('Re-Open Ticket')
        .setEmoji('✅')
        .setID('ticketopen')
        let button3 = new disbut.MessageButton()
        .setStyle('gray')
        .setLabel('Transcript')
        .setEmoji('📑')
        .setID('ticketts')
        button.channel.send({
            buttons: [button1, button2, button3],
            embed: embed
        })
        button.channel.setName(`closed-${ticketnum}`)//Copyrights For TFC Mahmoud
    } else if (button.id === 'ticketdel') {
        button.defer()
        if (button.channel.name.includes('closed-')) {
        let embed = new Discord.MessageEmbed()
        .setDescription('**This Ticket Will Be Deleted In A Few Seconds**')
        .setFooter(`All Copyrights For TFC Mahmoud |-| Prefix: ${prefix}`)
        .setColor('RED')
        button.channel.send(embed)
            setTimeout(function() {
            button.channel.delete()
            }, 3000)
        } 
        if (button.channel.name.includes('ticket-')) {
        let embed = new Discord.MessageEmbed()
        .setDescription('**This Ticket Will Be Deleted In A Few Seconds**')//Copyrights For TFC Mahmoud
        .setColor('RED')
        .setFooter(`All Copyrights For TFC Mahmoud |-| Prefix: ${prefix}`)
        button.channel.send(embed)
            setTimeout(function() {
            button.channel.delete()
            }, 3000)
        }
        if (!button.channel.name.includes('ticket-')) {
          if (button.channel.name.includes('closed-')) return
          return button.channel.send('**This Is Not A Ticket ⛔**')
          }
        if (!button.channel.name.includes('closed-')) {
          if (button.channel.name.includes('ticket-')) return
          return button.channel.send('**This Is Not A Ticket ⛔**')
          }
    } else if (button.id === 'ticketopen') {
        button.defer()
        button.channel.setName(`ticket-${ticketnum}`)//Copyrights For TFC Mahmoud
        let closetic = new disbut.MessageButton()
        .setStyle('blurple')
        .setLabel('Close Ticket')
        .setEmoji('🔒')
        .setID('ticketclose')
        let embed = new Discord.MessageEmbed()
        .setDescription('**Ticket Re-Opened Successfully!**')
        .setFooter(`All Copyrights For TFC Mahmoud |-| Prefix: ${prefix}`)//Copyrights For TFC Mahmoud
        .setColor('GREEN')
        button.channel.send({
            buttons: closetic,
            embed: embed
        })
    }   else if (button.id === 'ticketts') {
        button.defer()
        const channel = button.channel
        fetchTranscript(channel, button, 99).then((data) => {
            const file = new Discord.MessageAttachment(data, `${channel.id}.html`);
            button.channel.send(file);
        });
    }
})


client.on('message', msg => {
  if (msg.content.startsWith(prefix + 'reset-ticket')) {
    if (!msg.member.hasPermission('ADMINISTRATOR')) return msg.channel.send(`**You Do Not Have The Permission \`ADMINISTRATOR\` To Preform This Command!**`)
    let ticketnum = db.fetch(`ticket_${msg.guild.id}`)
    if (ticketnum === null) return msg.channel.send('**No Tickets To Reset!**')//Copyrights For TFC Mahmoud
    msg.channel.send(`**Done! I Have Deleted \`${ticketnum}\` Ticket**`)
    db.delete(`ticket_${msg.guild.id}`)
  }
})

client.on('message', msg => {
  if (msg.content === prefix + 'delete') {
    if (msg.channel.name.includes('closed-')) {
        let embed = new Discord.MessageEmbed()
        .setDescription('**This Ticket Will Be Deleted In A Few Seconds**')
        .setFooter(`All Copyrights For TFC Mahmoud |-| Prefix: ${prefix}`)//Copyrights For TFC Mahmoud
        .setColor('RED')
        msg.channel.send(embed)
            setTimeout(function() {
            msg.channel.delete()
            }, 3000)
        } 
        if (msg.channel.name.includes('ticket-')) {
        let embed = new Discord.MessageEmbed()
        .setDescription('**This Ticket Will Be Deleted In A Few Seconds**')//Copyrights For TFC Mahmoud
        .setColor('RED')
        .setFooter(`All Copyrights For TFC Mahmoud |-| Prefix: ${prefix}`)
        msg.channel.send(embed)
            setTimeout(function() {
            msg.channel.delete()
            }, 3000)
        }
        if (!msg.channel.name.includes('ticket-')) {
          if (msg.channel.name.includes('closed-')) return
          return msg.channel.send('**This Is Not A Ticket ⛔**')//Copyrights For TFC Mahmoud
          }
        if (!msg.channel.name.includes('closed-')) {
          if (msg.channel.name.includes('ticket-')) return
          return msg.channel.send('**This Is Not A Ticket ⛔**')//Copyrights For TFC Mahmoud
          }
  }
})



client.login(token).catch(err => {
    console.log(chalk.red('Invalid Token!'))
})
