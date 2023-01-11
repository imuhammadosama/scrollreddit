import './App.css';

import './assets/styles/search.css';
import axios from 'axios';
import { useEffect, useState } from 'react';
import WhiteLogo from './assets/images/white-logo.svg';
import BlackLogo from './assets/images/black-logo.svg';

export default function () {
  const [theme, setTheme] = useState();
  const [subReddits, setSubReddits] = useState([]);
  const [searching, setSearching] = useState(false);
  const [subReddit, setSubReddit] = useState('MostBeautiful');
  const [searchValue, setSearchValue] = useState(subReddit);
  const [searchType, setSearchType] = useState('subreddit');
  const [searchTime, setSearchTime] = useState('All');
  const [searchTrend, setSearchTrend] = useState('Top');
  const [columns, setColumns] = useState(4);
  const [posts, setPosts] = useState([]);
  const [postType, setPostType] = useState('All');
  const [loading, setLoading] = useState(false);
  const [moreLoading, setMoreLoading] = useState(false);
  const [sfw, setSfw] = useState('off');
  let pageNumber = 1;
  let count = 0;
  let itemsNumber = 96 / columns;
  let postNumber = 0;

  useEffect(() => {
    window
      .matchMedia('(prefers-color-scheme: dark)')
      .addEventListener('change', (event) => {
        const newColorScheme = event.matches ? 'dark' : 'light';
        newColorScheme === 'dark' ? setTheme('Dark') : setTheme('Light');
      });
    async function fetch() {
      pageNumber = 1;
      setLoading(true);
      setSearching(false);
      const response = await axios.get(
        `https://reddnight-server.herokuapp.com/${searchType}?q=${subReddit}&filter=${searchTrend}&time=${searchTime}&page=${pageNumber}`
      );
      window.innerWidth < 720 ? setColumns(1) : setColumns(4);
      setPosts(response.data.posts);
      console.log(subReddits);
      setLoading(false);
    }
    fetch();
  }, [subReddit, searchTime, searchTrend]);

  const getSubReddits = async (value) => {
    const searchItems = await axios.get(
      `https://www.reddit.com/${searchType}s/search.json?q=${value}&include_over_18=${sfw}`
    );

    setSubReddits(
      searchType === 'user'
        ? searchItems.data.data.children.map((d) => d['data'].name)
        : searchItems.data.data.children.map((d) => d['data'].display_name)
    );
  };

  const updatePosts = async () => {
    pageNumber++;
    setMoreLoading(true);
    const response = await axios.get(
      `https://reddnight-server.herokuapp.com/${searchType}?q=${subReddit}&filter=${searchTrend}&time=${searchTime}&page=${pageNumber}`
    );
    setPosts((oldPosts) => [...oldPosts, ...response.data.posts]);
    setMoreLoading(false);
  };

  return (
    <div>
      <div
        className='flex flex-center pt-24 pb-8'
        id='header'
        onClick={() => setSearching(false)}
      >
        <img
          id='logo'
          src={
            window.matchMedia &&
            window.matchMedia('(prefers-color-scheme: dark)').matches
              ? WhiteLogo
              : BlackLogo
          }
        />
      </div>
      <div className='search pt-24 pb-24'>
        <div className='search-field' id='search-field'>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              setSubReddit(document.getElementById('search-input').value);
            }}
          >
            <input
              id='search-input'
              autoComplete='off'
              placeholder={searchType === 'user' ? '/u' : '/r'}
              onFocus={() => setSearching(true)}
              value={searchValue}
              onChange={(e) => {
                setTimeout(() => {
                  getSubReddits(e.target.value);
                }, 1500);
                setSearchValue(e.target.value);
              }}
            ></input>
            <div
              className={
                searching && subReddits.length !== 0
                  ? 'search-values show'
                  : 'search-values'
              }
              id='search-values'
            >
              {subReddits.map((item, index) => {
                return (
                  <div
                    key={index}
                    onClick={() => {
                      setSubReddit(item);
                      setSubReddits([]);
                      setSearchValue(item);
                      setSearching(false);
                    }}
                  >
                    {item}
                  </div>
                );
              })}
            </div>
          </form>
          <select
            className='search-select'
            value={searchType}
            onChange={(e) => setSearchType(e.target.value)}
          >
            <option value='subreddit'>Subreddit</option>
            <option value='user'>User</option>
          </select>
          <select
            className='select-type'
            onChange={(e) => setPostType(e.target.value)}
          >
            <option value='All'>All</option>
            <option value='Videos'>Videos</option>
            <option value='Images'>Images</option>
          </select>
          <select
            className='select-time'
            onChange={(e) => setSearchTime(e.target.value)}
          >
            <option value='All'>All</option>
            <option value='Hour'>Hour</option>
            <option value='Day'>Day</option>
            <option value='Year'>Year</option>
          </select>
          <select
            className='select-trend'
            onChange={(e) => setSearchTrend(e.target.value)}
          >
            <option value='Top'>Top</option>
            <option value='Hot'>Hot</option>
            <option value='Rising'>Rising</option>
            <option value='New'>New</option>
          </select>
        </div>
      </div>

      {loading ? (
        <div className='text flex flex-center py-64'>Loading...</div>
      ) : (
        <div className='row'>
          {posts.map((item, index) => {
            if (index === 1 || index % itemsNumber === 0) {
              count = postNumber;
              return (
                <div className='column' key={index}>
                  {posts
                    .slice(count, count + itemsNumber)
                    .map((post, index) => {
                      postNumber++;
                      if (
                        post.type === 'video' &&
                        (postType === 'All' || postType === 'Videos')
                      )
                        return (
                          <video
                            width='100%'
                            controls
                            key={index}
                            poster={post.preview.url}
                            onDoubleClick={() => {
                              setSearchType('user');
                              setSubReddit(post.author);
                              setSearchValue(post.author);
                            }}
                          >
                            <source
                              src={post.fallback_media}
                              type='video/mp4'
                            />
                          </video>
                        );
                      if (
                        post.type === 'image' &&
                        (postType === 'All' || postType === 'Images')
                      )
                        return (
                          <img
                            key={index}
                            src={post.media}
                            width='100%'
                            onDoubleClick={() => {
                              setSearchType('user');
                              setSubReddit(post.author);
                              setSearchValue(post.author);
                            }}
                          />
                        );
                    })}
                </div>
              );
            }
          })}
        </div>
      )}

      <div className='flex flex-center py-64'>
        <button onClick={updatePosts} className='button'>
          {moreLoading ? 'Loading...' : 'Load More'}
        </button>
      </div>

      <a id='back-to-top' href='#header'>
        Top
      </a>
    </div>
  );
}
