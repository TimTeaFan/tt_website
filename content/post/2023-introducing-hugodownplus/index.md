---
output:
  hugodownplus::md_document:
    use_boxes: TRUE
    toc: TRUE

title: "Introducing: {hugodownplus} 📦"
subtitle: "An #RStats collaboration story"
summary: "This blog post showcases the three main features of the new {hugodownplus} package: a table of content, expandable HTML boxes, and a session info box."
authors: []
tags: ["R", "Rmarkdown", "hugodown", "package"]
categories: ["R", "Rmarkdown", "hugodown", "package"]
date: 2023-02-22
lastmod: 2023-02-22
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
rmd_hash: bfe27e3bc403f37a

---

-   <a href="#intro" id="toc-intro">Intro</a>
-   <a href="#idea-history-collaboration" id="toc-idea-history-collaboration">Idea &amp; History &amp; Collaboration</a>
-   <a href="#main-features" id="toc-main-features">Main Features</a>
-   <a href="#a-glimpse-under-the-hood" id="toc-a-glimpse-under-the-hood">A Glimpse under the Hood</a>
-   <a href="#wrap-up" id="toc-wrap-up">Wrap-up</a>

## Intro

In the last weeks I have put together a small R package <a href="https://timteafan.github.io/hugodownplus/" role="highlight">{hugodownplus}</a> which extends {hugodown} - the package which powers the blog posts of this and other #RStats Hugo websites.

{hugodownplus} offers a drop-in replacement for the rather minimalistic `hugodown::md_markdown()` output format.

This blog post showcases the three main features of {hugodownplus}:

1.  a table of content,
2.  an expandable session info box, and
3.  wrapping text or code in expandable HTML boxes.

Although the main features are already explained in the official <a href="https://timteafan.github.io/hugodownplus/" role="highlight">documentation</a>, the big advantage of this blog post is that we can actually showcase each feature, which is neither possible in a GitHub README nor within a {pkgdown} website.

Before diving into the details, I'll briefly elaborate on where the idea and inspiration for this package came from. After showcasing the main features, this blog post gives a glimpse under the hood, and shows how some of the more advanced features are implemented.

## Idea & History & Collaboration

After I spent quite some time creating and customizing this website, which is made with <a href="https://gohugo.io" role="highlight">Hugo</a> and <a href="https://hugodown.r-lib.org" role="highlight">{hugodown}<a/>, <a href="https://quarto.org" role="highlight">quarto</a> became a big thing and I saw a lot of stuff I liked and wanted to bring to my own blog.

It all started with me reading a blog post on <a herf="https://themockup.blog" role="highlight">"The MockUp"</a> which showed a table of content and used different boxes for code, more information and the session info. I immediately wanted to bring those features to my website, but as I'm no expert in Rmarkdown, I wasn't sure if it'd be possible.

I started implementing a table of content, which was pretty straightforward, since this functionality is already included in the [`rmarkdown::md_document()`](https://pkgs.rstudio.com/rmarkdown/reference/md_document.html) function. All I had to do was to copy code from there to extend the [`hugodown::md_document()`](https://rdrr.io/pkg/hugodown/man/md_document.html) output function.

Then I somehow figured out how to create an Rmarkdown child document that contains the session info wrapped in an expandable box using the `<details>` and `<summary>` HTML tags.

Now I wanted to go one step further, and come up with a function that wraps **any** content, text or code or a child document in an expandable *info*, *warn* or *output box*. And this is basically where I gave up on figuring it out alone.

I posted a <a href="https://stackoverflow.com/questions/75195909/pass-body-of-rmarkdown-chunk-as-argument-to-child-document" role="highlight">question on SO</a> and put a bounty on it. Luckily, I got help from <a href="https://twitter.com/shafayet_shafee" role="highlight">Shafayet</a> who answered this and a related <a href="https://stackoverflow.com/questions/75251741/wrap-rmarkdown-child-in-additional-html" role="highlight">question</a>.

After implementing all of this, I had a lot of custom functions and files in my website project and the idea was to package it up, so that it is easier to maintain, and others might benefit from it too. Since I was only putting code from different places into this package, and the really unique stuff came from Shafayet, I asked him to become a co-author. All in all it was a fun project and it made me happy to see the power of the #RStats community.

## Main Features

Below I'll showcase the three main features of {hugodownplus}:

1.  a table of content,
2.  an expandable session info box, and
3.  expandable HTML boxes to wrap text or code

#### Table of Content

This feature is basically copied from [`rmarkdown::md_document()`](https://pkgs.rstudio.com/rmarkdown/reference/md_document.html) and behaves pretty much in the same way. When using [`hugodownplus::md_document()`](https://timteafan.github.io/hugodownplus/reference/md_document.html) as output in an Rmarkdown document, we can add the `toc` argument and set it to `TRUE`. This will add a table of content containing all headings up to the third level. To specify the level of headings we can supply the `toc_depth` argument which defaults to `3`.

<div class="highlight">

<pre class='chroma'><code class='language-r' data-lang='r'>---
output:
  hugodownplus::md_document:
    toc: TRUE

title: "Article title"
# other arguments continuing here ...
---
</code></pre>

</div>

This alone renders a rather naked table of content to the top of the page. To make it look a little bit more visually pleasing, I have implemented a few customization using CSS:

First, I wanted to include the heading "Table of Content" which I added as `content` `before` the `first-child` element of an unordered list `ul` inside the `article-style` class:

<div class="highlight">

<pre class='chroma'><code class='language-r' data-lang='r'>.article-style>ul:first-child:before {
  content: "Table of Content";
}
</code></pre>

</div>

Since the CSS targets no other parts of this website this was a quick and easy way to add the words "Table of Content".

Further, I wanted to put the TOC in a centered box and add arrows "‣" as bullets of the top and second level headings:

<div class="highlight">

<pre class='chroma'><code class='language-r' data-lang='r'>.article-style > ul:first-child {
  margin: auto; /* centers the TOC */
  padding-top: 10px;
  padding-bottom: 10px;
  border: 1px dotted rgb(105,175,255); /* the border */
  border-radius: 5px;
  list-style-type: "‣  "; /* arrows first level headings */
}

.article-style > ul:first-child > li > ul {
  list-style-type: "‣  "; /* arrows second level headings */
}
</code></pre>

</div>

The result can be seen on the top of this page. The only downside is that the custom CSS is not applied when this blog post is shown on other sites like "R-bloggers".

#### Session Info Box

Besides [`md_document()`](https://timteafan.github.io/hugodownplus/reference/md_document.html) {hugodownplus} contains a second function: [`child_session_info()`](https://timteafan.github.io/hugodownplus/reference/child_session_info.html). When used as inline code in an Rmarkdown document, this will create an expandable box containing the current session info.

<div class="highlight">

<pre class='chroma'><code class='language-r' data-lang='r'>---
output: hugodownplus::md_document

title: "Article title"
# other arguments continuing here ...
# we do not need the `use_boxes` argument !
---

# Heading 1

Some text

`r child_session_info()`
</code></pre>

</div>

This alone will render a rather naked HTML box containing the session info using the `<details>` and `<summary>` tags.

<div markdown="1">

<details>
<summary>
Session Info <i class="fas fa-tools"></i>
</summary>

<div class="highlight">

<pre class='chroma'><code class='language-r' data-lang='r'><span><span class='c'>#&gt; <span style='color: #00BBBB; font-weight: bold;'>─ Session info ───────────────────────────────────────────────────────────────</span></span></span>
<span><span class='c'>#&gt;  <span style='color: #555555; font-style: italic;'>setting </span> <span style='color: #555555; font-style: italic;'>value</span></span></span>
<span><span class='c'>#&gt;  version  R version 4.2.1 (2022-06-23)</span></span>
<span><span class='c'>#&gt;  os       macOS Big Sur ... 10.16</span></span>
<span><span class='c'>#&gt;  system   x86_64, darwin17.0</span></span>
<span><span class='c'>#&gt;  ui       X11</span></span>
<span><span class='c'>#&gt;  language (EN)</span></span>
<span><span class='c'>#&gt;  collate  en_US.UTF-8</span></span>
<span><span class='c'>#&gt;  ctype    en_US.UTF-8</span></span>
<span><span class='c'>#&gt;  tz       Europe/Berlin</span></span>
<span><span class='c'>#&gt;  date     2023-02-22</span></span>
<span><span class='c'>#&gt;  pandoc   2.19.2 @ /Applications/RStudio.app/Contents/MacOS/quarto/bin/tools/ (via rmarkdown)</span></span>
<span><span class='c'>#&gt; </span></span>
<span><span class='c'>#&gt; <span style='color: #00BBBB; font-weight: bold;'>─ Packages ───────────────────────────────────────────────────────────────────</span></span></span>
<span><span class='c'>#&gt;  <span style='color: #555555; font-style: italic;'>package     </span> <span style='color: #555555; font-style: italic;'>*</span> <span style='color: #555555; font-style: italic;'>version   </span> <span style='color: #555555; font-style: italic;'>date (UTC)</span> <span style='color: #555555; font-style: italic;'>lib</span> <span style='color: #555555; font-style: italic;'>source</span></span></span>
<span><span class='c'>#&gt;  hugodownplus * <span style='color: #BB00BB; font-weight: bold;'>0.0.0.9000</span> <span style='color: #555555;'>2023-02-19</span> <span style='color: #555555;'>[1]</span> <span style='color: #BB00BB; font-weight: bold;'>Github (timteafan/hugodownplus@d79c4c0)</span></span></span>
<span><span class='c'>#&gt; </span></span>
<span><span class='c'>#&gt; <span style='color: #555555;'> [1] /Library/Frameworks/R.framework/Versions/4.2/Resources/library</span></span></span>
<span><span class='c'>#&gt; </span></span>
<span><span class='c'>#&gt; <span style='color: #00BBBB; font-weight: bold;'>──────────────────────────────────────────────────────────────────────────────</span></span></span>
<span></span></code></pre>

</div>

</details>

</div>

<br>

To make it more visually pleasing, we need some CSS magic:

For this website I use the code blow to ...

1.  ... get padding and margins right,
2.  ... customize the font, color and background of the box' header and body, and
3.  ... format the inline code so that it covers the whole box and is displayed in grey.

<div class="output-box" title="Expand to see CSS code">

<div class="highlight">

<pre class='chroma'><code class='language-r' data-lang='r'>/* padding, margins and border */
.session {
  border: solid rgb(178, 178, 178);
  border-width: 1px 1px 1px 5px;
  border-radius: 5px;
  padding: 0;
  margin-left: 0px;
  margin-top: 15px;
  margin-bottom: 25px;
}

/* box header: background, color, font and padding */
summary.session-header {
  padding: 2px 10px 0px 10px;
  margin: 0;
  background: rgb(31, 34, 41); 
  color: rgb(178, 178, 178);
  font-family: Open Sans,Lucida Sans Unicode,Lucida Grande,sansSerif;
  font-size: smaller;
  border-radius: 5px;
}

/* change background color when box is expanded */
details[open] > summary.session-header {
  background: rgb(41, 47, 61);
}

/* padding and margin of box body */
.session-details {
  padding: 10px 10px 0px 10px;
  margin: 0 0 10px 0;
}

/* code inside box: margins and setting the border around code to 0 */
details > div > pre.chroma {
  border-width: 0px;
  margin-left: 0px;
  margin-bottom: 0px;
}

/* code inside box: text color */ 
details.sess > div > pre > code > span > span > span.hljs-comment,
details.sess > div > pre > code > span > span > span > span.hljs-comment {
  color: rgb(178, 178, 178);
}
</code></pre>

</div>

</div>

Adding the above CSS code renders the following box:

<div class="session" markdown="1">

<details class="sess">
<summary class="session-header">
Session Info <i class="fas fa-tools"></i>
</summary>

<div class="highlight">

<pre class='chroma'><code class='language-r' data-lang='r'><span><span class='c'>#&gt; <span style='color: #00BBBB; font-weight: bold;'>─ Session info ───────────────────────────────────────────────────────────────</span></span></span>
<span><span class='c'>#&gt;  <span style='color: #555555; font-style: italic;'>setting </span> <span style='color: #555555; font-style: italic;'>value</span></span></span>
<span><span class='c'>#&gt;  version  R version 4.2.1 (2022-06-23)</span></span>
<span><span class='c'>#&gt;  os       macOS Big Sur ... 10.16</span></span>
<span><span class='c'>#&gt;  system   x86_64, darwin17.0</span></span>
<span><span class='c'>#&gt;  ui       X11</span></span>
<span><span class='c'>#&gt;  language (EN)</span></span>
<span><span class='c'>#&gt;  collate  en_US.UTF-8</span></span>
<span><span class='c'>#&gt;  ctype    en_US.UTF-8</span></span>
<span><span class='c'>#&gt;  tz       Europe/Berlin</span></span>
<span><span class='c'>#&gt;  date     2023-02-22</span></span>
<span><span class='c'>#&gt;  pandoc   2.19.2 @ /Applications/RStudio.app/Contents/MacOS/quarto/bin/tools/ (via rmarkdown)</span></span>
<span><span class='c'>#&gt; </span></span>
<span><span class='c'>#&gt; <span style='color: #00BBBB; font-weight: bold;'>─ Packages ───────────────────────────────────────────────────────────────────</span></span></span>
<span><span class='c'>#&gt;  <span style='color: #555555; font-style: italic;'>package     </span> <span style='color: #555555; font-style: italic;'>*</span> <span style='color: #555555; font-style: italic;'>version   </span> <span style='color: #555555; font-style: italic;'>date (UTC)</span> <span style='color: #555555; font-style: italic;'>lib</span> <span style='color: #555555; font-style: italic;'>source</span></span></span>
<span><span class='c'>#&gt;  hugodownplus * <span style='color: #BB00BB; font-weight: bold;'>0.0.0.9000</span> <span style='color: #555555;'>2023-02-19</span> <span style='color: #555555;'>[1]</span> <span style='color: #BB00BB; font-weight: bold;'>Github (timteafan/hugodownplus@d79c4c0)</span></span></span>
<span><span class='c'>#&gt; </span></span>
<span><span class='c'>#&gt; <span style='color: #555555;'> [1] /Library/Frameworks/R.framework/Versions/4.2/Resources/library</span></span></span>
<span><span class='c'>#&gt; </span></span>
<span><span class='c'>#&gt; <span style='color: #00BBBB; font-weight: bold;'>──────────────────────────────────────────────────────────────────────────────</span></span></span>
<span></span></code></pre>

</div>

</details>

</div>

#### Expandable HTML Boxes

[`hugodownplus::md_document()`](https://timteafan.github.io/hugodownplus/reference/md_document.html) can generate *info*, *warn* and *output boxes*. The idea is that, in a blog post on topic X, we might want to talk a bit more about details of a related concept Y. This might not be interesting for every reader, so we can put this part in an expandable *info box*, and those interested, can dive in further. Similarly, we can create *warn boxes*, which draw the attention to one specific issue not every reader might be interested in. Finally *output boxes* can be used to show the output of a code chunk, only if the reader wants to see it (we actually encountered one of those already above).

To generate an *info*, *warn* or *output box* we just wrap text and/or code (or a child document) into a fenced (pandoc) div using three colons ::: before and after the part that we want to put into a box:

<div class="highlight">

<pre class='chroma'><code class='language-r' data-lang='r'>::: {.info-box title="Expand: Title of my info box"}

This is a test box.

We can include text and code:
```{r}
# Here is a code comment and below some code
1 + 1
```
:::
</code></pre>

</div>

All we have to do is to specify either `{.info-box}`, `{.warn-box}` or `{.output-box}` and a `title` inside the div fence `:::`. The `title` will be shown in the header of the box. We also need to set the `use_boxes` argument in the Rmarkdown header to `TRUE`.

Similar to the session info box, this will render a naked HTML box:

<div markdown="1">

<details>
<summary>
Expand: Title of my info box<i class="fas fa-info"></i>
</summary>
<p>
This is a test box
</p>
<p>
We can include text and code:
</p>

<div class="highlight">

<pre class='chroma'><code class='language-r' data-lang='r'><span><span class='c'># Here is a code comment and below some code</span></span>
<span><span class='m'>1</span> <span class='o'>+</span> <span class='m'>1</span></span>
<span><span class='c'>#&gt; [1] 2</span></span>
<span></span></code></pre>

</div>

</details>

</div>

<br>

Again, some CSS styling is needed to make the box "shine":

<div class="output-box" title="Expand to see CSS code">

<div class="highlight">

<pre class='chroma'><code class='language-r' data-lang='r'>/* border, margin and padding */ 
.info-box {
  margin-bottom: 15px;
}

.note {
  border: solid rgb(51, 192, 155);
  border-width: 1px 1px 1px 5px;
  border-radius: 5px;
  padding: 0;
  margin-left: 0px;
}

/* header color, background and font */
summary.note-header,
.note-header {
  padding: 2px 10px 0px 10px;
  margin: 0;
  background: rgb(31, 34, 41);
  color: rgb(51, 192, 155);
  font-family: Open Sans,Lucida Sans Unicode,Lucida Grande,sansSerif;
  font-size: smaller;
  border-radius: 5px;
}

/* body padding, margin, font-size */
.note-details {
  padding: 10px 10px 0px 10px;
  margin: 0 0 10px 0;
  font-size: 0.8335rem;
}

/* placement of the icon */
.note-header > i {
  margin-left: 5px;
}

/* code in box: no margins and no border */
details > div.note-details > div.highlight > pre.chroma {
  border-width: 0px;
  margin-left: 0px;
  margin-bottom: 0px;
  padding: 0;
  margin-top: -20px;
}

/* code in box: code background and border radius */
details > div.note-details > div.highlight > pre.chroma > code {
  background: #383b49;
  border-radius: 3px;
}
</code></pre>

</div>

</div>

Together with the CSS code above the following box will be rendered:

<div class="info-box" title="Expand: Title of my info box">

This is a test box.

We can include text and code:

<div class="highlight">

<pre class='chroma'><code class='language-r' data-lang='r'><span><span class='c'># Here is a code comment and below some code</span></span>
<span><span class='m'>1</span> <span class='o'>+</span> <span class='m'>1</span> </span>
[1] 2
</code></pre>

</div>

</div>

## A Glimpse under the Hood

The reminder of this blog post give a glimpse under the hood, and shows how the *session info box* as well as the expandable HTML boxes are implemented. Let's start with the easier one.

#### Session info box

The session info box is created by the [`child_session_info()`](https://timteafan.github.io/hugodownplus/reference/child_session_info.html) function. The only thing that this function does is to create an Rmarkdown child document based on a template `session_info.Rmd` using the `kntir::knit_child()` function.

<div class="highlight">

<pre class='chroma'><code class='language-r' data-lang='r'><span><span class='nv'>child_session_info</span> <span class='o'>&lt;-</span> <span class='kr'>function</span><span class='o'>(</span><span class='nv'>pkgs</span> <span class='o'>=</span> <span class='nf'><a href='https://rdrr.io/r/base/c.html'>c</a></span><span class='o'>(</span><span class='s'>"loaded"</span>, <span class='s'>"attached"</span>, <span class='s'>"installed"</span><span class='o'>)</span><span class='o'>[</span><span class='m'>1</span><span class='o'>]</span><span class='o'>)</span> <span class='o'>&#123;</span></span>
<span>  <span class='nf'>knitr</span><span class='nf'>::</span><span class='nf'><a href='https://rdrr.io/pkg/knitr/man/knit_child.html'>knit_child</a></span><span class='o'>(</span><span class='nf'>fs</span><span class='nf'>::</span><span class='nf'><a href='https://fs.r-lib.org/reference/path_package.html'>path_package</a></span><span class='o'>(</span><span class='s'>"rmdtmp/session_info.Rmd"</span>,</span>
<span>                                     package <span class='o'>=</span> <span class='s'>"hugodownplus"</span><span class='o'>)</span>,</span>
<span>                    envir <span class='o'>=</span> <span class='nf'><a href='https://rdrr.io/r/base/environment.html'>environment</a></span><span class='o'>(</span><span class='o'>)</span>,</span>
<span>                    quiet <span class='o'>=</span> <span class='kc'>TRUE</span><span class='o'>)</span></span>
<span><span class='o'>&#125;</span></span></code></pre>

</div>

The essence of the `session_info.Rmd` template looks like this:

<div class="highlight">

<pre class='chroma'><code class='language-r' data-lang='r'>&lt;div class="session" markdown="1"&gt;
  &lt;details class="sess"&gt;
    &lt;summary class="session-header" markdown="1"&gt;
      Session Info &lt;i class="fas fa-tools"&gt;&lt;/i&gt;
    &lt;/summary&gt;
```{r, echo = FALSE}
sessioninfo::session_info(pkgs = pkgs)
```
  &lt;/details&gt;
&lt;/div&gt;
</code></pre>

</div>

Basically, we wrap a code chunk containing the [`sessioninfo::session_info()`](https://r-lib.github.io/sessioninfo/reference/session_info.html) function into `<details>` and `<summary>` HTML tags together with a custom `<div>` and some HMTL classes to make the styling easier.

#### Expandable HTML boxes

While it would be possible to create similar HTML boxes by just wrapping them in HTML tags manually, I was looking for a way to make it easier to create this kind of boxes.

Writing a custom R function would have been one way to go about it, but I preferred a solution which would let me create HTML boxes within an Rmarkdown document "on the fly".

To do that, Shafayet came up with a great idea on SO. We can use pandoc's `includes` argument and set the `after_body` parameter to an HTML file which will be included after the body is rendered.

This HTML document is basically javascript wrapped in HTML `<script>` tags.

The code that generates the info boxes is shown below. To make sense of it, it helps to read it from bottom to top.

<div class="highlight">

<pre class='chroma'><code class='language-r' data-lang='r'>&lt;script&gt;
  function create_info_box(title, content) {
    let summary = document.createElement("summary");
    summary.classList.add("note-header");
    summary.setAttribute("markdown", "1");

    let summary_title = document.createTextNode(title)
    let summary_icon = document.createElement('i');
    summary_icon.classList.add("fas", "fa-info-circle");
    summary.append(summary_title, summary_icon);

    let div_note_details = document.createElement("div");
    div_note_details.classList.add('note-details');
    div_note_details.append(...content)

    let details = document.createElement('details');
    details.append(summary, div_note_details);

    let div_note = document.createElement("div");
    div_note.classList.add('note');
    div_note.setAttribute("markdown", "1");
    div_note.append(details);
    return(div_note)
  };

  function info_box() {
    let childs = document.querySelectorAll("div.info-box");
    childs.forEach(el => {
      let title = el.title
      let info_box = create_info_box(title, el.childNodes);
      el.append(info_box)
    });
  };

  window.onload = info_box();
&lt;/script&gt;
</code></pre>

</div>

When the page is is loaded `window.onload` the `info_box()` function is executed. The `info_box()` function selects all `<div class="info-box">` elements. For each element `el` that it is found, it executes the `create_info_box()` function, which is defined at the very top of the script. Without going into details here, this function basically creates all the single parts, the `<summary>` and `<details>` tags the classes and attributes and it wraps the `...content` in the middle of all this.

So where does the `<div class="info-box">` come from? We create those on the fly by wrapping a section of our Rmarkdown document in a fenced pandoc div: `::: {.info-box} content goes here :::`. When the document is knitted the HTML file below will be executed and will render our boxes accordingly.

Although it now sounds pretty simple, I'd never figured this out alone.

Another possible way of implementing the same feature is to use <a href="https://yihui.org/knitr/hooks/" role="highlight">knitr hooks</a> which offer a similar functionality to change the output of a document after knitting. However, I haven't got my head around knitr hooks yet, but might give them a try when the next Rmarkdown challenge awaits.

## Wrap-up

That's it! While many #RStats bloggers are porting their Hugo website to quarto, I'd be happy if one or the other Hugo user finds this package helpful - or at least the insights I gained in the process of making it. If you know betters ways of implementing this, maybe using knitr hooks, let me know in the comments below or via Mastodon, Twitter or Github!

<script>
  function create_info_box(title, content) {
    let summary = document.createElement("summary");
    summary.classList.add("note-header");
    summary.setAttribute("markdown", "1");

    let summary_title = document.createTextNode(title)
    let summary_icon = document.createElement('i');
    summary_icon.classList.add("fas", "fa-info-circle");
    summary.append(summary_title, summary_icon);

    let div_note_details = document.createElement("div");
    div_note_details.classList.add('note-details');
    div_note_details.append(...content)

    let details = document.createElement('details');
    details.append(summary, div_note_details);

    let div_note = document.createElement("div");
    div_note.classList.add('note');
    div_note.setAttribute("markdown", "1");
    div_note.append(details);
    return(div_note)
  };

  function create_warn_box(title, content) {
    let summary = document.createElement("summary");
    summary.classList.add("warn-header");
    summary.setAttribute("markdown", "1");

    let summary_title = document.createTextNode(title)
    let summary_icon = document.createElement('i');
    summary_icon.classList.add("fas", "fa-exclamation-circle");
    summary.append(summary_title, summary_icon);

    let div_warn_details = document.createElement("div");
    div_warn_details.classList.add('warn-details');
    div_warn_details.append(...content)

    let details = document.createElement('details');
    details.append(summary, div_warn_details);

    let div_warn = document.createElement("div");
    div_warn.classList.add('warn');
    div_warn.setAttribute("markdown", "1");
    div_warn.append(details);
    return(div_warn)
  };

  function create_output_box(title, content) {
    let summary = document.createElement("summary");
    summary.classList.add("output-header");
    summary.setAttribute("markdown", "1");

    let summary_title = document.createTextNode(title)
    let summary_icon = document.createElement('i');
    summary_icon.classList.add("fas", "fa-laptop-code");
    summary.append(summary_title, summary_icon);

    let div_output_details = document.createElement("div");
    div_output_details.classList.add('output-details');
    div_output_details.append(...content)

    let details = document.createElement('details');
    details.append(summary, div_output_details);

    let div_output = document.createElement("div");
    div_output.classList.add('output');
    div_output.setAttribute("markdown", "1");
    div_output.append(details);
    return(div_output)
  };

  function info_box() {
    let childs = document.querySelectorAll("div.info-box");
    childs.forEach(el => {
      let title = el.title
      let info_box = create_info_box(title, el.childNodes);
      el.append(info_box)
    });
  };

  function warn_box() {
    let childs = document.querySelectorAll("div.warn-box");
    childs.forEach(el => {
      let title = el.title
      let warn_box = create_warn_box(title, el.childNodes);
      el.append(warn_box)
    });
  };

  function output_box() {
    let childs = document.querySelectorAll("div.output-box");
    childs.forEach(el => {
      let title = el.title
      let output_box = create_output_box(title, el.childNodes);
      el.append(output_box)
    });
  };

 function load_boxes() {
     info_box();
     warn_box();
     output_box();
   }

  window.onload = load_boxes();
</script>

