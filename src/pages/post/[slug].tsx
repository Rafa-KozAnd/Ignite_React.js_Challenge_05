import { GetStaticPaths, GetStaticProps } from 'next';

import { parseISO, format } from 'date-fns';
import ptBR from 'date-fns/locale/pt-BR';

import { FiClock, FiCalendar, FiUser } from 'react-icons/fi';

import { RichText } from 'prismic-dom';
import Head from 'next/head';
import { useRouter } from 'next/router';
import commonStyles from '../../styles/common.module.scss';
import styles from './post.module.scss';
import { getPrismicClient } from '../../services/prismic';

interface Post {
  first_publication_date: string | null;
  data: {
    title: string;
    banner: {
      url: string;
    };
    author: string;
    content: {
      heading: string;
      body: {
        text: string;
      }[];
    }[];
  };
}

interface PostProps {
  post: Post;
}

export default function Post({ post }: PostProps) {
  const { isFallback } = useRouter();

  if (isFallback) {
    return <p>Carregando...</p>;
  }

  const totalPostWords = post.data.content.reduce((acc, item) => {
    const heading = item.heading.trim().split(' ').length;
    const body = item.body.reduce((accumulator, { text }) => {
      return (accumulator += text.trim().split(' ').length);
    }, 0);

    return (acc += heading + body);
  }, 0);

  const minutesToReadThePost = Math.ceil(totalPostWords / 200);

  return !post ? (
    <p>Carregando...</p>
  ) : (
    <>
      <Head>
        <title>{post.data.title} | Spacetravelling</title>
      </Head>

      <section className={styles.header}>
        <img src={post.data.banner.url} alt="" />
      </section>
      <main className={commonStyles.content}>
        <article>
          <h1 className={styles.title}>{post.data.title}</h1>
          <div className={styles.details_container}>
            <div className={styles.details}>
              <FiCalendar />
              <span>
                {format(parseISO(post.first_publication_date), 'dd MMM yyyy', {
                  locale: ptBR,
                }).toString()}
              </span>
            </div>
            <div className={styles.details}>
              <FiUser />
              <span>{post.data.author}</span>
            </div>
            <div className={styles.details}>
              <FiClock />
              <span>{minutesToReadThePost} min</span>
            </div>
          </div>
          <div className={styles.body_content}>
            {post.data.content.map(({ heading, body }) => {
              return (
                <div key={heading} className={styles.heading_content}>
                  <h3>{heading}</h3>
                  {body.map(({ text }, index) => (
                    <p key={index}>{text}</p>
                  ))}
                </div>
              );
            })}
          </div>
        </article>
      </main>
    </>
  );
}

export const getStaticPaths: GetStaticPaths = async () => {
  const prismic = getPrismicClient({});
  const posts = await prismic.getByType('posts', {
    lang: 'pt-BR',
  });

  const paths = posts.results.map(post => {
    return {
      params: {
        slug: post.uid,
      },
    };
  });

  return {
    paths,
    fallback: true,
  };
};

export const getStaticProps: GetStaticProps = async ({ params }) => {
  const prismic = getPrismicClient({});

  const { slug } = params;

  const response = await prismic.getByUID('posts', String(slug), {});

  const post = {
    uid: response.uid, // Adicionar o UID
    first_publication_date: response.first_publication_date, // Remover a formatação desse campo
    data: {
      title: response.data.title,
      subtitle: response.data.subtitle, // Adicionar subtitle
      banner: {
        url: response.data.banner.url,
      },
      author: response.data.author,
      content: response.data.content,
    },
  };

  return {
    props: {
      post,
    },
    redirect: 60 * 30, // 30 minutos
  };
};