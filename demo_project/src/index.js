import chewie from 'chewie-pics';

import * as _something from './blorp';

import request from 'request';

console.log(request);



request
  .get('https://jsonplaceholder.typicode.com/todos/1')
  .on('response', console.log);


const toChewieAssetFolder = filename => {
  return {
    src: `./vendor/chewie-pics/assets/${filename}`,
    title: `Chewie #${/\d+/.exec(filename)[0]}`
  };
};

document.addEventListener('DOMContentLoaded', () => {
  const initialChewie = toChewieAssetFolder(chewie.random());
  const button = document.getElementById('chewie_button');
  const imgWrapper = document.querySelector('figure');
  const img = document.createElement('img');
  img.src = initialChewie.src;
  img.alt =
    'A small, very dapper black-and-white dog,' +
    'with a very fluffy tail and a lot of personality.';

  const caption = document.createElement('figcaption');
  caption.innerText = initialChewie.title;
  imgWrapper.append(img, caption);

  button.addEventListener('click', () => {
    const { src, title } = toChewieAssetFolder(chewie.random());
    img.src = src;
    caption.innerText = title;
  });
});
