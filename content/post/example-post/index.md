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
rmd_hash: 0c3215760fe04a2e

---

This is my first example post. Lets see how R code gets rendered.

<div class="highlight">

<pre class='chroma'><code class='language-r' data-lang='r'><span class='nf'><a href='https://rdrr.io/r/base/library.html'>library</a></span>(<span class='k'><a href='https://dplyr.tidyverse.org'>dplyr</a></span>)
<span class='k'>iris</span> <span class='o'>%&gt;%</span> 
  <span class='k'>glimpse</span></code></pre>

</div>

<div class="highlight">

<pre class='chroma'><code class='language-r' data-lang='r'><span class='nf'><a href='https://rdrr.io/r/base/library.html'>library</a></span>(<span class='k'><a href='https://dplyr.tidyverse.org'>dplyr</a></span>)
<span class='c'>#&gt; </span>
<span class='c'>#&gt; Attaching package: 'dplyr'</span>
<span class='c'>#&gt; The following objects are masked from 'package:stats':</span>
<span class='c'>#&gt; </span>
<span class='c'>#&gt;     filter, lag</span>
<span class='c'>#&gt; The following objects are masked from 'package:base':</span>
<span class='c'>#&gt; </span>
<span class='c'>#&gt;     intersect, setdiff, setequal, union</span>

<span class='kr'>if</span>(<span class='m'>1</span><span class='o'>&gt;</span><span class='m'>0</span>) {
  <span class='nf'><a href='https://rdrr.io/r/base/print.html'>print</a></span>(<span class='s'>"Hello"</span>)
}
<span class='c'>#&gt; [1] "Hello"</span>
<span class='kr'>NULL</span> <span class='c'># a comment</span>
<span class='c'>#&gt; NULL</span>

<span class='k'>a_number</span> <span class='o'>&lt;-</span> <span class='m'>232</span>

<span class='m'>Inf</span>
<span class='c'>#&gt; [1] Inf</span>


<span class='k'>iris</span>[,<span class='m'>1</span><span class='o'>:</span><span class='m'>5</span>] <span class='o'>%&gt;%</span> 
  <span class='k'>glimpse</span>
<span class='c'>#&gt; Rows: 150</span>
<span class='c'>#&gt; Columns: 5</span>
<span class='c'>#&gt; $ Sepal.Length <span style='color: #555555;font-style: italic;'>&lt;dbl&gt;</span><span> 5.1, 4.9, 4.7, 4.6, 5.0, 5.4, 4.6, 5.0, 4.4, 4.9, 5.4, 4…</span></span>
<span class='c'>#&gt; $ Sepal.Width  <span style='color: #555555;font-style: italic;'>&lt;dbl&gt;</span><span> 3.5, 3.0, 3.2, 3.1, 3.6, 3.9, 3.4, 3.4, 2.9, 3.1, 3.7, 3…</span></span>
<span class='c'>#&gt; $ Petal.Length <span style='color: #555555;font-style: italic;'>&lt;dbl&gt;</span><span> 1.4, 1.4, 1.3, 1.5, 1.4, 1.7, 1.4, 1.5, 1.4, 1.5, 1.5, 1…</span></span>
<span class='c'>#&gt; $ Petal.Width  <span style='color: #555555;font-style: italic;'>&lt;dbl&gt;</span><span> 0.2, 0.2, 0.2, 0.2, 0.2, 0.4, 0.3, 0.2, 0.2, 0.1, 0.2, 0…</span></span>
<span class='c'>#&gt; $ Species      <span style='color: #555555;font-style: italic;'>&lt;fct&gt;</span><span> setosa, setosa, setosa, setosa, setosa, setosa, setosa, …</span></span></code></pre>

</div>

