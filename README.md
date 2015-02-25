#Angular and socket.io chat application
This amazing website was built with Angularjs, socket.io and n00by bootstrap
##Read this if you are using our application for the first time
1. Run **npm install** in your project folder. This command will create a *node_modules* folder which contains all necessary grunt tasks.
2. Run **bower install** in your project folder. This command will create a *bower_components* folder inside the *Client* folder. 
3. Type in **grunt** which will build our project and spit out a minified file which will be located in the *dist* folder
4. You will most likely need to open two terminal windows. In the first window open the *Client* folder and type **python -m SimpleHTTPServer**. In the second window go to *Server* folder and type **node chatserver.js**. You can also run scripts for these commands which are located in the folders.

##Few things that users should be aware of

1. If you create a room then you will automatically become an operator of that particular room.
2. If an operator leaves the current chat room or choses 'return to lobby' and re-enters the same room, he will lose all his op privileges. So if you are an operator on a chatroom, why not give someone else the privilege to become an operator. That way if you decide to leave the chat room all control won't be lost.

3. If an operator ops another user there's is nothing that can save you from that newly deopped user to deop the original op.
Be careful about who you op.
4. You can send private messages to yourself. That might be strange, but remember you can send e-mails and facebook messages to yourself.

5. In the private message window you are provided with a dropdown of active users on the chat. Choose one to send pm to.
it will be delivered.

6. You will not be able to perform any actions(op, deop, kick, ban) on yourself under any circumstances.
7. There are no advertised topics on the available chat rooms. So just have fun and explore!

8. Logging out will send you back to the login page. Your nick name is now free for everyone to grab.
