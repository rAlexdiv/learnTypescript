<script setup lang="ts">
import { reactive, ref } from 'vue';

interface Post { 
  title: string, 
  content: string 
};

const posts = ref<Post[]>([]);
const post = ref<Post>({ 
  title: '', 
  content: '',
});

const storePost = () => {
  if (post.value.title.trim() !== '' && post.value.content.trim() !== '') {
    posts.value.unshift({
      title: post.value.title,
      content: post.value.content,
    });
  }
  post.value = { title: '', content: '' };
};
</script>


<template>
  <div class="main">
    <h1>twitter</h1>
    <div class="form title">
      <input v-model="post.title" type="text" placeholder="title" class="title">
    </div>
    <div class="form content">
      <textarea v-model="post.content" name="content" id="content" placeholder="content"></textarea>
    </div>
    <div class="button">
      <button @click="storePost">Опубликовать</button>
    </div>
    <div style="padding: 10px; border: 1px solid #ccc; margin-top: 10px;">
      <div v-for="p in posts" class="posts" style="margin-bottom: 10px;">
        {{ p.title }} <br />
        {{ p.content }}
      </div>
    </div>
  </div>
</template>


<style scoped>
</style>
