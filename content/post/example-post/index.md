---
output: hugodown::md_document
# Documentation: https://sourcethemes.com/academic/docs/managing-content/

title: "Example post"
subtitle: "This is my first example post"
summary: "In this post I want to show how to create a blog post with hugodown"
authors: 
tags: 
categories: [R]
date: 2020-07-22
lastmod: 2020-07-22
featured: false
draft: false

# Featured image
# To use, add an image named `featured.jpg/png` to your page's folder.
# Focal points: Smart, Center, TopLeft, Top, TopRight, Left, Right, BottomLeft, Bottom, BottomRight.
image:
  caption: ""
  focal_point: ""
  preview_only: false

# Projects (optional).
#   Associate this post with one or more of your projects.
#   Simply enter your project's folder or file name without extension.
#   E.g. `projects = ["internal-project"]` references `content/project/deep-learning/index.md`.
#   Otherwise, set `projects = []`.
projects: []
rmd_hash: e838480641229502

---

This is my first example post. Lets see how R code gets rendered. Here is some `inline code`.

<div class="highlight">

<pre class='chroma'><code class='language-r' data-lang='r'><span class='nf'><a href='https://rdrr.io/r/base/library.html'>library</a></span>(<span class='k'><a href='https://dplyr.tidyverse.org'>dplyr</a></span>)
<span class='k'>iris</span> <span class='o'>%&gt;%</span> 
  <span class='k'>glimpse</span></code></pre>

</div>

<div class="highlight">

<pre class='chroma'><code class='language-r' data-lang='r'><span class='nf'><a href='https://rdrr.io/r/base/library.html'>library</a></span>(<span class='k'><a href='https://dplyr.tidyverse.org'>dplyr</a></span>)
<span class='nf'><a href='https://rdrr.io/r/base/UseMethod.html'>UseMethod</a></span>(<span class='s'>"plot"</span>)

<span class='k'>myfun</span> <span class='o'>&lt;-</span> <span class='nf'>function</span>(<span class='k'>x</span>,<span class='k'>y</span>) <span class='k'>x</span> <span class='o'>+</span> <span class='k'>y</span>

<span class='kr'>if</span>(<span class='m'>1</span><span class='o'>&gt;</span><span class='m'>0</span>) {
  <span class='nf'><a href='https://rdrr.io/r/base/print.html'>print</a></span>(<span class='s'>"Hello"</span>)
}
<span class='kr'>NULL</span> <span class='c'># a comment</span>

<span class='k'>a_number</span> <span class='o'>&lt;-</span> <span class='m'>232</span>

<span class='m'>Inf</span>



<span class='k'>iris</span>[,<span class='m'>1</span><span class='o'>:</span><span class='m'>5</span>] <span class='o'>%&gt;%</span> 
  <span class='k'>glimpse</span></code></pre>

</div>

