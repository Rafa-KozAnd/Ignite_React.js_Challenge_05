import { GetStaticProps } from 'next';
import Head from 'next/head';

import { getPrismicClient } from '../services/prismic';
import {FiClock, FiCalendar} from 'react-icons/fi';

import commonStyles from '../styles/common.module.scss';
import styles from './home.module.scss';

import { 
  parseISO, 
  format, 
} from 'date-fns';
import ptBR from 'date-fns/locale/pt-BR';
import Link from 'next/link';
import { useState } from 'react';

interface Post {
  uid?: string;
  first_publication_date: string | null;
  data: {
    title: string;
    subtitle: string;
    author: string;
  };
}

interface PostPagination {
  next_page: string;
  results: Post[];
}

interface HomeProps {
  postsPagination: PostPagination;
}

export default function Home({ postsPagination }: HomeProps) {
  const [posts, setPosts] = useState(postsPagination);
  const [hasNext, setHasNext] = useState(!!postsPagination.next_page);

  function loadAllPosts(link: string) {
    fetch(link).then(response => response.json())
      .then(data => {

        const newPosts = {...posts};

        setPosts({
          ...newPosts,
          next_page: data.next_page,
          results: [...newPosts.results, ...data.results]
        })
        setHasNext(!!data.next_page)
      })
  }

  return (
    <>
      <Head>
        <title>Home | Spacetravelling</title>
      </Head>
      <main className={`${commonStyles.content}`}>
        {
          posts.results.map(result => (            
            <div key={result.uid} className={styles.home_container}>
              <Link  href={`/post/${result.uid}`}>
                <a><h1 className={styles.title}>{result.data.title}</h1></a>
              </Link>
              <p>{result.data.subtitle}</p>
              <div className={styles.details}>
                <div className={styles.details_container}>
                  <FiCalendar />
                  <span>
                    {format(
                      parseISO(result.first_publication_date),
                      'dd MMM yyyy',
                      {
                        locale: ptBR,
                      }
                    ).toString()}
                  </span>
                </div>
                <div className={styles.details_container}>
                  <FiClock />
                  <span>{result.data.author}</span>
                </div>
              </div>
            </div>
          ))
        }
        {
          hasNext && <div className={styles.button_container}>
            <button 
              type="button" 
              className={styles.load_button}
              onClick={() => loadAllPosts(posts.next_page)}
            >Carregar mais posts</button>
          </div>
        }
      </main>
    </>
  )
}

export const getStaticProps: GetStaticProps = async () => {
  const prismic = getPrismicClient({});
  const postsResponse = await prismic.getByType("posts", {
    lang: 'pt-BR',
    pageSize: 3,
  });

  const postsPagination = {...postsResponse}

  return {
    props: {
      postsPagination, 
    },   
  }
};