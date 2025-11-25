import fs from 'fs';
import { genUserData, genTimestampString, resetUsers, chooseFromArray } from '../user_generator/usergen.js';
import { faker } from '@faker-js/faker';

resetUsers();

const validMovieIds = JSON.parse(fs.readFileSync("data/valid_movie_ids.json", "utf8"));

const seenUser = new Set();
const seenMovie = new Set();
const seenTag = new Set();

// use argument when running script
const userRange = parseInt(process.argv[2]) || 2; // default 2

const watchlistRange = userRange;

let customListRange = 0;
let reviewRange = 0;
let tagRange = 0;

// user
function insertUser() {
    let userArr = [];

    for (let i = 0; i < userRange; i++) {
        userArr.push(genUserData());
    }

    return userArr;
}

// user_follow
function insertUserFollow() {
    let followRows = [];
    let followed_id = 0;

    for (let i = 1; i <= userRange; i++) {
        let numFollows = Math.floor(Math.random() * 25);
        for (let j = 0; j < numFollows; j++) {
            followed_id = Math.floor(Math.random() * userRange) + 1;

            // avoid self-follow and duplicate followed
            if (followed_id === i || seenUser.has(followed_id)) continue;

            followRows.push(`('${i}', '${followed_id}', '${genTimestampString(2025, 2025)}')`);

            seenUser.add(followed_id);
        }
        seenUser.clear();
    }

    return followRows;
}

// user_like
function insertUserLike() {
    let userLikeRows = [];
    let movie_id;

    for (let i = 1; i < userRange; i++) {
        let numMovies = Math.floor(Math.random() * 50);
        for (let j = 0; j < numMovies; j++) {
            movie_id = chooseFromArray(validMovieIds);

            // avoid user liking same movie more than once
            if (seenMovie.has(movie_id)) continue;

            userLikeRows.push(`('${i}', '${movie_id}', '${genTimestampString(2025, 2025)}')`);

            seenMovie.add(movie_id);
        }
        seenMovie.clear();
    }

    return userLikeRows;
}

// watchlist_movie
function insertWatchlistMovie() {
    let watchlistRows = [];
    let movie_id;

    for (let i = 1; i < watchlistRange; i++) {
        let numMovies = Math.floor(Math.random() * 5);
        for (let j = 0; j < numMovies; j++) {
            movie_id = chooseFromArray(validMovieIds);

            // avoid adding same movie to watchlist more than once
            if (seenMovie.has(movie_id)) continue;

            watchlistRows.push(`('${i}', '${movie_id}', '${genTimestampString(2025, 2025)}')`);

            seenMovie.add(movie_id);
        }
        seenMovie.clear();
    }

    return watchlistRows;
}

// movie_log
function insertMovieLog() {
    let movieLogRows = [];
    let movie_id;

    for (let i = 1; i < userRange; i++) {
        let numMovies = Math.floor(Math.random() * 5);

        for (let j = 0; j < numMovies; j++) {
            movie_id = chooseFromArray(validMovieIds);
            movieLogRows.push(`('${i}', '${movie_id}', '${genTimestampString(2025, 2025)}')`);
        }
    }

    return movieLogRows;
}

// custom_list
function insertCustomList() {
    let customListRows = [];

    let title = '';
    let description = '';
    let visibility = '';

    for (let i = 1; i < userRange; i++) {
        let numLists = Math.floor(Math.random() * 2);
        for (let j = 0; j < numLists; j++) {

            title = faker.lorem.word({ length: { min: 5, max: 7 }, strategy: 'closest' });

            description = faker.lorem.paragraph(1);

            visibility = Math.random() < 0.35 ? 'private' : 'public';

            customListRows.push(`('${i}', '${title}', '${description}', '${visibility}')`);
        }

        customListRange++;
    }

    return customListRows;
}

//custom_list_movie
function insertCustomListMovie() {
    let customListMovieRows = [];
    let movie_id;

    for (let i = 1; i < customListRange; i++) {
        let numMovies = Math.floor(Math.random() * 5);
        for (let j = 0; j < numMovies; j++) {
            movie_id = chooseFromArray(validMovieIds);

            // avoid adding same movie to custom_list more than once
            if (seenMovie.has(movie_id)) continue;

            customListMovieRows.push(`('${i}', '${movie_id}', ${j + 1})`);

            seenMovie.add(movie_id);
        }
        seenMovie.clear();
    }

    return customListMovieRows;
}

// review
function insertReview() {
    let reviewRows = [];

    let rating;
    let content = '';
    let movie_id;

    for (let i = 1; i < userRange; i++) {
        let numMovies = Math.floor(Math.random() * 5);

        for (let j = 0; j < numMovies; j++) {

            movie_id = chooseFromArray(validMovieIds);

            // avoid reviewing same movie more than once
            if (seenMovie.has(movie_id)) continue;

            rating = Math.floor(Math.random() * 10) + 1 // 1-10

            content = Math.random() < 0.70 ? 'null' : faker.lorem.paragraph();

            if (content == null) {
                reviewRows.push(`('${i}', '${movie_id}', ${rating}, ${content})`);
            }
            else {
                reviewRows.push(`('${i}', '${movie_id}', ${rating}, '${content}')`);
            }

            seenMovie.add(movie_id);
        }
        seenMovie.clear();
        reviewRange++;
    }

    return reviewRows;
}

// review_like
function insertReviewLike() {
    let reviewLikeRows = [];

    for (let i = 1; i <= reviewRange; i++) {

        let numLikes = Math.floor(Math.random() * 10);
        for (let j = 0; j < numLikes; j++) {
            let user_id = Math.floor(Math.random() * (userRange - 1) + 1);

            if (seenUser.has(user_id)) continue;

            reviewLikeRows.push(`(${user_id}, ${i})`);

            seenUser.add(user_id);
        }
        seenUser.clear();
    }

    return reviewLikeRows;
}

// review_comment
function insertReviewComment() {
    let reviewCommentRows = [];

    let numComments = 0;
    let user_id;
    let content = '';

    for (let i = 1; i <= reviewRange; i++) {

        numComments = Math.floor(Math.random() * 4);

        for (let j = 0; j < numComments; j++) {
            user_id = Math.floor(Math.random() * (userRange - 1) + 1);

            if (seenUser.has(user_id)) continue;

            content = faker.lorem.sentence();

            reviewCommentRows.push(`(${i}, ${user_id}, '${content}')`);

            seenUser.add(user_id);
        }
        seenUser.clear();
    }

    return reviewCommentRows;
}

// tag
function insertTag() {
    let tagRows = [];
    let tag;

    for (let i = 0; i < 400; i++) {

        tag = faker.music.genre();

        if (seenTag.has(tag)) continue;

        tagRows.push(`('${tag}')`);

        seenTag.add(tag);
        tagRange++;
    }

    seenTag.clear();
    return tagRows;
}

// tag_review
function insertTagReview() {
    let tagReviewRows = [];
    let tag_id;

    for (let i = 1; i <= reviewRange; i++) {
        let numTags = Math.floor(Math.random() * 5);
        
        for (let j = 0; j < numTags; j++) {
            tag_id = Math.floor(Math.random() * tagRange + 1);

            if (seenTag.has(tag_id)) continue;
            
            // assign random tag_id
            tagReviewRows.push(`(${tag_id}, ${i})`);

            seenTag.add(tag_id);
        }
        seenTag.clear();
    }

    return tagReviewRows;
}

// tag_custom_list
function insertTagCustomList() {
    let tagCustomListRows = [];
    let tag_id;

    for (let i = 1; i <= customListRange; i++) {
        let numTags = Math.floor(Math.random() * 5);
        
        for (let j = 0; j < numTags; j++) {
            tag_id = Math.floor(Math.random() * tagRange + 1);

            if (seenTag.has(tag_id)) continue;
            
            // assign random tag_id
            tagCustomListRows.push(`(${tag_id}, ${i})`);

            seenTag.add(tag_id);
        }
        seenTag.clear();
    }

    return tagCustomListRows;
}

// build the output string
function buildDataOutput() {
    let dataOutput = [];

    let userOutput = 'insert into `user`(`username`, `email`, `password`, `bio`, `joined_at`, `dob`, `status`) values ' + insertUser().join(',') + ';\n';
    dataOutput.push(userOutput);

    let followOutput = 'insert into `user_follow`(`follower_id`, `followed_id`, `created_at`) values ' + insertUserFollow().join(',') + ';\n';
    dataOutput.push(followOutput);

    let userLikeOutput = 'insert into `user_like`(`user_id`, `movie_id`, `added_at`) values ' + insertUserLike().join(',') + ';\n';
    dataOutput.push(userLikeOutput);

    let watchlistMovieOutput = 'insert into `watchlist_movie`(`watchlist_id`, `movie_id`, `added_at`) values ' + insertWatchlistMovie().join(',') + ';\n';
    dataOutput.push(watchlistMovieOutput);

    let movieLogOutput = 'insert into `movie_log`(`user_id`, `movie_id`, `added_at`) values ' + insertMovieLog().join(',') + ';\n';
    dataOutput.push(movieLogOutput);

    let customListOutput = 'insert into `custom_list`(`user_id`, `title`, `description`, `visibility`) values ' + insertCustomList().join(',') + ';\n';
    dataOutput.push(customListOutput);

    let customListMovieOutput = 'insert into `custom_list_movie`(`list_id`, `movie_id`, `sort_order`) values ' + insertCustomListMovie().join(',') + ';\n';
    dataOutput.push(customListMovieOutput);

    let reviewOutput = 'insert into `review`(`user_id`, `movie_id`, `rating`, `content`) values ' + insertReview().join(',') + ';\n';
    dataOutput.push(reviewOutput);

    let reviewLikeOutput = 'insert into `review_like`(`user_id`, `review_id`) values ' + insertReviewLike().join(',') + ';\n';
    dataOutput.push(reviewLikeOutput);

    let reviewCommentOutput = 'insert into `review_comment`(`user_id`, `review_id`) values ' + insertReviewComment().join(',') + ';\n';
    dataOutput.push(reviewCommentOutput);

    let tagOutput = 'insert into `tag`(`name`) values ' + insertTag().join(',') + ';\n';
    dataOutput.push(tagOutput);
    
    let tagReviewOutput = 'insert into `tag_review`(`tag_id`, `review_id`) values ' + insertTagReview().join(',') + ';\n';
    dataOutput.push(tagReviewOutput);

    let tagCustomListOutput = 'insert into `tag_custom_list`(`tag_id`, `list_id`) values ' + insertTagCustomList().join(',') + ';\n';
    dataOutput.push(tagCustomListOutput);

    return dataOutput;
}

// write output to a file
fs.writeFileSync('data.sql', buildDataOutput().join(''));