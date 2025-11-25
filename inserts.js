import fs from 'fs';
import { genUserData, genTimestampString, resetUsers } from '../user_generator/usergen.js';

resetUsers();

const maxUsers = 10000

// generate data for user_follow
const followRows = [];
let followOutput = '';

const userArr = [];
let userOutput = '';

const dataArr = [];

let followed_id = 0;

for (let i = 0; i < maxUsers; i++) {
    userArr.push(genUserData());
}

for (let i = 1; i <= maxUsers; i++) {
    const numFollows = Math.floor(Math.random() * 26); // 0–50
    for (let j = 0; j < numFollows; j++) {
        followed_id = Math.floor(Math.random() * maxUsers) + 1;

        // avoid self-follow
        if (followed_id === i) continue;

        followRows.push(`('${i}', '${followed_id}', '${genTimestampString(2025, 2025)}')`);
    }
}

userOutput = 'insert into `user`(`username`, `email`, `password`, `bio`, `joined_at`, `dob`, `status`)\nvalues\n' + userArr.join(',\n') + ';\n\n';
followOutput = 'insert into `follows`(`follower_id`, `followed_id`, `created_at`) values\n' + followRows.join(',\n') + ';\n\n';

fs.writeFileSync('data.sql', userOutput + followOutput);