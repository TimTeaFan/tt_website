---
output:
  hugodownplus::md_document:
    toc: TRUE
# Documentation: https://sourcethemes.com/academic/docs/managing-content/

title: "Static and Dynamic Web Scraping with R"
subtitle: ""
summary: "This blog provides an instructive guide to web scraping in R, starting with basic techniques and advancing to complex tasks. It covers scraping static and dynamic websites, string manipulation and recursive functions."
authors: []
tags: ["R", "rvest", "RSelenium", "web scraping"]
categories: ["R", "rvest", "RSelenium", "web scraping"]
date: 2023-05-31
lastmod: 2023-05-31
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
rmd_hash: e56a7f88dc6c945e

---

-   <a href="#intro" id="toc-intro">Intro</a>
-   <a href="#basic-web-scraping" id="toc-basic-web-scraping">Basic Web Scraping</a>
-   <a href="#advanced-web-scraping" id="toc-advanced-web-scraping">Advanced Web Scraping</a>
-   <a href="#wrap-up" id="toc-wrap-up">Wrap-up</a>

## Intro

Welcome to this blog post where we're going to explore web scraping in R. So far, I've used R for some basic web scraping jobs, like pulling the list of all available R packages from CRAN. But recently, I faced a task that required a bit more advanced web scraping skills. As someone who tends to forget stuff quickly, I thought it would be a good idea to write down the approaches I used. Not only will it help my future me, but it might also help interested readers.

We're going to start things off easy with a simple case of scraping content from one static website. Then, we'll raise the bar a bit and deal with a more advanced case. This involves gathering content from several similar pages, and to make matters more interesting, the links to those pages are displayed with dynamic loading.

## Basic Web Scraping

Beyond recreational experimentation, the first time I put web scraping to some real use was for the <a href="https://github.com/TimTeaFan/rstatspkgbot" role="highlight" target="_blank">rstatspkgbot</a>. It's a bot for Twitter (and now also on Mastodon) that tweets about the R packages available on CRAN.

On CRAN, there's a <a href="https://cran.r-project.org/web/packages/available_packages_by_name.html" role="highlight" target="_blank">list of all available R packages</a>. This list has everything we need: the package name, description, and a link to its specific CRAN package website.

How do we get this info? It's only two simple steps. First, we use the {rvest} package to access the package list and read the HTML.

<div class="highlight">

<pre class='chroma'><code class='language-r' data-lang='r'><span><span class='kr'><a href='https://rdrr.io/r/base/library.html'>library</a></span><span class='o'>(</span><span class='nv'><a href='https://rvest.tidyverse.org/'>rvest</a></span><span class='o'>)</span></span>
<span><span class='kr'><a href='https://rdrr.io/r/base/library.html'>library</a></span><span class='o'>(</span><span class='nv'><a href='https://dplyr.tidyverse.org'>dplyr</a></span><span class='o'>)</span></span>
<span><span class='kr'><a href='https://rdrr.io/r/base/library.html'>library</a></span><span class='o'>(</span><span class='nv'><a href='https://tidyr.tidyverse.org'>tidyr</a></span><span class='o'>)</span></span>
<span></span>
<span><span class='c'># read in CRAN package list</span></span>
<span><span class='nv'>cran_url</span> <span class='o'>&lt;-</span> <span class='s'>"https://cran.r-project.org/web/packages/available_packages_by_name.html"</span></span>
<span><span class='nv'>cran_pkg_by_name</span> <span class='o'>&lt;-</span> <span class='nf'><a href='http://xml2.r-lib.org/reference/read_xml.html'>read_html</a></span><span class='o'>(</span><span class='nv'>cran_url</span><span class='o'>)</span></span></code></pre>

</div>

Next, we call `html_element("table")` to select the `<table>` tag which contains all the package infos. We then pipe the result into [`html_table()`](https://rvest.tidyverse.org/reference/html_table.html) to convert the HTML table into a `tibble`. We use {dplyr} to change the column names `X1` and `X2` into `name` and `description`, drop all rows with `NA`, and add a `link` column with [`mutate()`](https://dplyr.tidyverse.org/reference/mutate.html)for all remaining packages.

<div class="highlight">

<pre class='chroma'><code class='language-r' data-lang='r'><span><span class='nv'>pkg_tbl</span> <span class='o'>&lt;-</span> <span class='nv'>cran_pkg_by_name</span> <span class='o'>|&gt;</span></span>
<span>  <span class='nf'><a href='https://rvest.tidyverse.org/reference/html_element.html'>html_element</a></span><span class='o'>(</span><span class='s'>"table"</span><span class='o'>)</span> <span class='o'>|&gt;</span></span>
<span>  <span class='nf'><a href='https://rvest.tidyverse.org/reference/html_table.html'>html_table</a></span><span class='o'>(</span><span class='o'>)</span> <span class='o'>|&gt;</span></span>
<span>  <span class='nf'><a href='https://dplyr.tidyverse.org/reference/rename.html'>rename</a></span><span class='o'>(</span><span class='s'>"name"</span> <span class='o'>=</span> <span class='nv'>X1</span>, <span class='s'>"description"</span> <span class='o'>=</span> <span class='nv'>X2</span><span class='o'>)</span> <span class='o'>|&gt;</span></span>
<span>  <span class='nf'><a href='https://tidyr.tidyverse.org/reference/drop_na.html'>drop_na</a></span><span class='o'>(</span><span class='o'>)</span> <span class='o'>|&gt;</span> </span>
<span>  <span class='nf'><a href='https://dplyr.tidyverse.org/reference/mutate.html'>mutate</a></span><span class='o'>(</span>link <span class='o'>=</span> <span class='nf'><a href='https://rdrr.io/r/base/paste.html'>paste0</a></span><span class='o'>(</span><span class='s'>"https://cran.r-project.org/web/packages/"</span>, <span class='nv'>name</span>, <span class='s'>"/index.html"</span><span class='o'>)</span><span class='o'>)</span></span>
<span></span>
<span><span class='nv'>pkg_tbl</span></span>
<span><span class='c'>#&gt; <span style='color: #555555;'># A tibble: 19,603 × 3</span></span></span>
<span><span class='c'>#&gt;    name          description                                               link </span></span>
<span><span class='c'>#&gt;    <span style='color: #555555; font-style: italic;'>&lt;chr&gt;</span>         <span style='color: #555555; font-style: italic;'>&lt;chr&gt;</span>                                                     <span style='color: #555555; font-style: italic;'>&lt;chr&gt;</span></span></span>
<span><span class='c'>#&gt; <span style='color: #555555;'> 1</span> A3            <span style='color: #555555;'>"</span>Accurate, Adaptable, and Accessible Error Metrics for P… http…</span></span>
<span><span class='c'>#&gt; <span style='color: #555555;'> 2</span> AalenJohansen <span style='color: #555555;'>"</span>Conditional Aalen-Johansen Estimation<span style='color: #555555;'>"</span>                   http…</span></span>
<span><span class='c'>#&gt; <span style='color: #555555;'> 3</span> AATtools      <span style='color: #555555;'>"</span>Reliability and Scoring Routines for the Approach-Avoid… http…</span></span>
<span><span class='c'>#&gt; <span style='color: #555555;'> 4</span> ABACUS        <span style='color: #555555;'>"</span>Apps Based Activities for Communicating and Understandi… http…</span></span>
<span><span class='c'>#&gt; <span style='color: #555555;'> 5</span> abbreviate    <span style='color: #555555;'>"</span>Readable String Abbreviation<span style='color: #555555;'>"</span>                            http…</span></span>
<span><span class='c'>#&gt; <span style='color: #555555;'> 6</span> abbyyR        <span style='color: #555555;'>"</span>Access to Abbyy Optical Character Recognition (OCR) API<span style='color: #555555;'>"</span> http…</span></span>
<span><span class='c'>#&gt; <span style='color: #555555;'> 7</span> abc           <span style='color: #555555;'>"</span>Tools for Approximate Bayesian Computation (ABC)<span style='color: #555555;'>"</span>        http…</span></span>
<span><span class='c'>#&gt; <span style='color: #555555;'> 8</span> abc.data      <span style='color: #555555;'>"</span>Data Only: Tools for Approximate Bayesian Computation (… http…</span></span>
<span><span class='c'>#&gt; <span style='color: #555555;'> 9</span> ABC.RAP       <span style='color: #555555;'>"</span>Array Based CpG Region Analysis Pipeline<span style='color: #555555;'>"</span>                http…</span></span>
<span><span class='c'>#&gt; <span style='color: #555555;'>10</span> ABCanalysis   <span style='color: #555555;'>"</span>Computed ABC Analysis<span style='color: #555555;'>"</span>                                   http…</span></span>
<span><span class='c'>#&gt; <span style='color: #555555;'># … with 19,593 more rows</span></span></span>
<span></span></code></pre>

</div>

That was quite straightforward, but it was primarily because CRAN conveniently had all the info we needed on a single page, in a single table.

But, let's not get too comfortable. Let's move to some more advanced web scraping.

## Advanced Web Scraping

The other day my wive wanted to compare different skincare serums from The Ordinary. However, the website lists 31 unique serums, each having its own product page with information scattered across various sections. Ideally, we wanted all this data in an Excel or CSV file, with each row representing a serum, and columns containing information such as product name, ingredients, usage instructions, and so on.

We initially thought of using ChatGPT for this task, but unfortunately, neither its native web browsing extension nor third-party page reader plugins could scrape the required information. This was the perfect occasion to engage in some traditional web scraping. Here are the challenges we faced:

-   the content was spread across several pages
-   on each page, information was scattered across different sections
-   one piece of data was displayed in the value attribute of a hidden input
-   the links to each product page were displayed with dynamic loading

We'll break this section into small parts, looking at collections of functions that solve specific problems. In the end we will piece everything together.

#### Scraping content from one page

Before we start to read in all different product pages, its a good idea to start with one page to test whether we can scrape the relevant information. Once this works, we can think about how to read in all the product pages.

The setup is similar to our simple case from above. We load the {rvest} library and read in the URL using [`read_html()`](http://xml2.r-lib.org/reference/read_xml.html).

<div class="highlight">

<pre class='chroma'><code class='language-r' data-lang='r'><span><span class='kr'><a href='https://rdrr.io/r/base/library.html'>library</a></span><span class='o'>(</span><span class='nv'><a href='https://rvest.tidyverse.org/'>rvest</a></span><span class='o'>)</span></span>
<span></span>
<span><span class='nv'>url</span> <span class='o'>&lt;-</span> <span class='s'>"https://theordinary.com/en-de/100-plant-derived-squalane-face-oil-100398.html"</span></span>
<span></span>
<span><span class='nv'>webpage</span> <span class='o'>&lt;-</span> <span class='nf'><a href='http://xml2.r-lib.org/reference/read_xml.html'>read_html</a></span><span class='o'>(</span><span class='nv'>url</span><span class='o'>)</span></span></code></pre>

</div>

Then, we use the DOM inspector of our browser to determine the correct CSS selector for the information we're interested in. We begin with the `product_name`. The HTML looks as follows:

    <h1 class="product-name">
      <span class="sr-only">The Ordinary 100% Plant-Derived Squalane</span>
      100% Plant-Derived Squalane
    </h1>

To extract the text within the `<span>` tag, we can use [`html_element()`](https://rvest.tidyverse.org/reference/html_element.html) with the CSS selector `"h1.product-name>span.sr-only"`, which means "the `<span>` tag with class `"sr-only"` inside the `<h1>` tag with class `"product-name"`. We pipe the result into [`html_text()`](https://rvest.tidyverse.org/reference/html_text.html) to extract the text of this element:

<div class="highlight">

<pre class='chroma'><code class='language-r' data-lang='r'><span><span class='nv'>product_name</span> <span class='o'>&lt;-</span> <span class='nv'>webpage</span> <span class='o'>|&gt;</span></span>
<span>  <span class='nf'><a href='https://rvest.tidyverse.org/reference/html_element.html'>html_element</a></span><span class='o'>(</span><span class='s'>"h1.product-name&gt;span.sr-only"</span><span class='o'>)</span> <span class='o'>|&gt;</span></span>
<span>  <span class='nf'><a href='https://rvest.tidyverse.org/reference/html_text.html'>html_text</a></span><span class='o'>(</span><span class='o'>)</span></span>
<span></span>
<span><span class='nv'>product_name</span></span>
<span><span class='c'>#&gt; [1] "The Ordinary 100% Plant-Derived Squalane"</span></span>
<span></span></code></pre>

</div>

This step was straightforward. Let's use the same approach for the next piece of information, labelled "Targets":

<div class="highlight">

<pre class='chroma'><code class='language-r' data-lang='r'><span><span class='nv'>skin_concern</span> <span class='o'>&lt;-</span> <span class='nv'>webpage</span> <span class='o'>|&gt;</span></span>
<span>  <span class='nf'><a href='https://rvest.tidyverse.org/reference/html_element.html'>html_element</a></span><span class='o'>(</span><span class='s'>"p.skin-concern.panel-item"</span><span class='o'>)</span> <span class='o'>|&gt;</span> </span>
<span>  <span class='nf'><a href='https://rvest.tidyverse.org/reference/html_text.html'>html_text</a></span><span class='o'>(</span><span class='o'>)</span></span>
<span></span>
<span><span class='nv'>skin_concern</span></span>
<span><span class='c'>#&gt; [1] "\n                                            Targets\n                                            \n                                                Dryness,\n                                            \n                                                Hair\n                                            \n                                        "</span></span>
<span></span></code></pre>

</div>

While this does extract the data we're after, there are two issues. First, the output includes a lot of white spaces and line breaks that we need to remove. Second, the output begins with "Targets", which is the heading. We're interested only in the actual content, which begins after that.

To address both problems, we use the {stringr} package. The [`str_squish()`](https://stringr.tidyverse.org/reference/str_trim.html) function eliminates white space at the start and end, and replaces all internal white space with a single space. We pipe the result into [`str_replace()`](https://stringr.tidyverse.org/reference/str_replace.html) to remove the leading heading "Targets".

<div class="highlight">

<pre class='chroma'><code class='language-r' data-lang='r'><span><span class='kr'><a href='https://rdrr.io/r/base/library.html'>library</a></span><span class='o'>(</span><span class='nv'><a href='https://stringr.tidyverse.org'>stringr</a></span><span class='o'>)</span></span>
<span></span>
<span><span class='nv'>skin_concern</span> <span class='o'>&lt;-</span> <span class='nv'>webpage</span> <span class='o'>|&gt;</span></span>
<span>  <span class='nf'><a href='https://rvest.tidyverse.org/reference/html_element.html'>html_element</a></span><span class='o'>(</span><span class='s'>"p.skin-concern.panel-item"</span><span class='o'>)</span> <span class='o'>|&gt;</span> </span>
<span>  <span class='nf'><a href='https://rvest.tidyverse.org/reference/html_text.html'>html_text</a></span><span class='o'>(</span><span class='o'>)</span> <span class='o'>|&gt;</span> </span>
<span>  <span class='nf'><a href='https://stringr.tidyverse.org/reference/str_trim.html'>str_squish</a></span><span class='o'>(</span><span class='o'>)</span> <span class='o'>|&gt;</span></span>
<span>  <span class='nf'><a href='https://stringr.tidyverse.org/reference/str_replace.html'>str_replace</a></span><span class='o'>(</span><span class='s'>"^Targets "</span>, <span class='s'>""</span><span class='o'>)</span></span>
<span></span>
<span><span class='nv'>skin_concern</span></span>
<span><span class='c'>#&gt; [1] "Dryness, Hair"</span></span>
<span></span></code></pre>

</div>

As the subsequent pieces of information are structured similarly, we create a helper function `html_element_to_text()`, which accepts a webpage, a CSS selector, and a regex pattern as input. It targets and extracts the text at the specified webpage's CSS selector and replaces the regex pattern with an empty string `""`.

<div class="highlight">

<pre class='chroma'><code class='language-r' data-lang='r'><span><span class='nv'>html_element_to_text</span> <span class='o'>&lt;-</span> <span class='kr'>function</span><span class='o'>(</span><span class='nv'>webpage</span>, <span class='nv'>selector</span>, <span class='nv'>pattern</span><span class='o'>)</span> <span class='o'>&#123;</span></span>
<span></span>
<span>  <span class='nv'>webpage</span> <span class='o'>|&gt;</span></span>
<span>    <span class='nf'><a href='https://rvest.tidyverse.org/reference/html_element.html'>html_element</a></span><span class='o'>(</span><span class='nv'>selector</span><span class='o'>)</span> <span class='o'>|&gt;</span></span>
<span>    <span class='nf'><a href='https://rvest.tidyverse.org/reference/html_text.html'>html_text</a></span><span class='o'>(</span><span class='o'>)</span> <span class='o'>|&gt;</span></span>
<span>    <span class='nf'><a href='https://stringr.tidyverse.org/reference/str_trim.html'>str_squish</a></span><span class='o'>(</span><span class='o'>)</span> <span class='o'>|&gt;</span></span>
<span>    <span class='nf'><a href='https://stringr.tidyverse.org/reference/str_replace.html'>str_replace</a></span><span class='o'>(</span><span class='nv'>pattern</span>, <span class='s'>""</span><span class='o'>)</span></span>
<span></span>
<span><span class='o'>&#125;</span></span></code></pre>

</div>

Using this function, we can obtain most of the information we're interested in: the skin types the product is "suited to", its "format", "when to use" it, and with which other products it's "not to use".

<div class="highlight">

<pre class='chroma'><code class='language-r' data-lang='r'><span><span class='nv'>suited_to</span> <span class='o'>&lt;-</span> <span class='nv'>webpage</span> <span class='o'>|&gt;</span></span>
<span>  <span class='nf'>html_element_to_text</span><span class='o'>(</span><span class='s'>"p.suitedTo.panel-item"</span>,</span>
<span>                       <span class='s'>"^Suited to "</span><span class='o'>)</span></span>
<span><span class='nv'>suited_to</span></span>
<span><span class='c'>#&gt; [1] "All Skin Types"</span></span>
<span></span><span></span>
<span><span class='nv'>format</span> <span class='o'>&lt;-</span> <span class='nv'>webpage</span> <span class='o'>|&gt;</span></span>
<span>  <span class='nf'>html_element_to_text</span><span class='o'>(</span><span class='s'>"p.format.panel-item"</span>,</span>
<span>                       <span class='s'>"^Format "</span><span class='o'>)</span></span>
<span><span class='nv'>format</span></span>
<span><span class='c'>#&gt; [1] "Anhydrous Serum"</span></span>
<span></span><span></span>
<span><span class='nv'>when_to_use_good_for</span> <span class='o'>&lt;-</span> <span class='nv'>webpage</span> <span class='o'>|&gt;</span></span>
<span>  <span class='nf'>html_element_to_text</span><span class='o'>(</span><span class='s'>"div.content.when-to-use"</span>,</span>
<span>                       <span class='s'>"^When to use "</span><span class='o'>)</span></span>
<span><span class='nv'>when_to_use_good_for</span></span>
<span><span class='c'>#&gt; [1] "Use in AM Use in PM Good for 6 months after opening."</span></span>
<span></span><span></span>
<span><span class='nv'>do_not_use</span> <span class='o'>&lt;-</span> <span class='nv'>webpage</span> <span class='o'>|&gt;</span></span>
<span>  <span class='nf'>html_element_to_text</span><span class='o'>(</span><span class='s'>"div.content.do-not-use"</span>,</span>
<span>                       <span class='s'>"^Do not use "</span><span class='o'>)</span></span>
<span><span class='nv'>do_not_use</span></span>
<span><span class='c'>#&gt; [1] NA</span></span>
<span></span></code></pre>

</div>

Note, that some sections might contain no text, like the "do not use with" section above. In this case an `NA` is shown which is not a problem for our purpose.

The only remaining issue is that the "when to use" section also includes information on until when the product is "good for". We can separate this information using a simple positive look ahead and look behind with the [`str_extract()`](https://stringr.tidyverse.org/reference/str_extract.html) function:

<div class="highlight">

<pre class='chroma'><code class='language-r' data-lang='r'><span><span class='c'># Positive look ahead: Extract everything before "Good for"</span></span>
<span><span class='nv'>when_to_use</span> <span class='o'>&lt;-</span> <span class='nf'><a href='https://stringr.tidyverse.org/reference/str_extract.html'>str_extract</a></span><span class='o'>(</span><span class='nv'>when_to_use_good_for</span>, <span class='s'>".*(?= Good for)"</span><span class='o'>)</span></span>
<span><span class='nv'>when_to_use</span></span>
<span><span class='c'>#&gt; [1] "Use in AM Use in PM"</span></span>
<span></span><span></span>
<span><span class='c'># Positive look behind: Extract everything after "Good for"</span></span>
<span><span class='nv'>good_for</span> <span class='o'>&lt;-</span> <span class='nf'><a href='https://stringr.tidyverse.org/reference/str_extract.html'>str_extract</a></span><span class='o'>(</span><span class='nv'>when_to_use_good_for</span>, <span class='s'>"(?&lt;=Good for ).*"</span><span class='o'>)</span></span>
<span><span class='nv'>good_for</span></span>
<span><span class='c'>#&gt; [1] "6 months after opening."</span></span>
<span></span></code></pre>

</div>

#### Scraping content from the value attribute of a hidden input field

While we've managed to get most of the info with our custom function, there's still a key piece of data that's not that easy to scrape.

For reasons that I don't fully understand, the "About" section of the product page is tucked away in the value attribute of a hidden input. It looks something like this:

    <input type="hidden" id="overview-about-text" value="%3Cp%3E100%25%20Plant-Derived%20Squalane%20hydrates%20your%20skin%20while%20supporting%20its%20natural%20moisture%20barrier.%20Squalane%20is%20an%20exceptional%20hydrator%20found%20naturally%20in%20the%20skin,%20and%20this%20formula%20uses%20100%25%20plant-derived%20squalane%20derived%20from%20sugar%20cane%20for%20a%20non-comedogenic%20solution%20that%20enhances%20surface-level%20hydration.%3Cbr%3E%3Cbr%3EOur%20100%25%20Plant-Derived%20Squalane%20formula%20can%20also%20be%20used%20in%20hair%20to%20increase%20heat%20protection,%20add%20shine,%20and%20reduce%20breakage.%3C/p%3E">

To scrape this data, we're going to use [`html_element()`](https://rvest.tidyverse.org/reference/html_element.html) to target the id of the hidden input `"#overview-about-text"` and then [`html_attr()`](https://rvest.tidyverse.org/reference/html_attr.html) to get the value attribute. Since the text is URL encoded, we use the [`URLdecode()`](https://rdrr.io/r/utils/URLencode.html) function from the base R {utils} package. This returns a character vector with HTML code. We'll then use the combination of [`read_html()`](http://xml2.r-lib.org/reference/read_xml.html) and [`html_text()`](https://rvest.tidyverse.org/reference/html_text.html) again to clear out the HTML and to extract only the text:

<div class="highlight">

<pre class='chroma'><code class='language-r' data-lang='r'><span><span class='nv'>overview_text</span> <span class='o'>&lt;-</span> <span class='nv'>webpage</span> <span class='o'>|&gt;</span></span>
<span>  <span class='nf'><a href='https://rvest.tidyverse.org/reference/html_element.html'>html_element</a></span><span class='o'>(</span><span class='s'>"#overview-about-text"</span><span class='o'>)</span> <span class='o'>|&gt;</span></span>
<span>  <span class='nf'><a href='https://rvest.tidyverse.org/reference/html_attr.html'>html_attr</a></span><span class='o'>(</span><span class='s'>"value"</span><span class='o'>)</span> <span class='o'>|&gt;</span></span>
<span>  <span class='nf'><a href='https://rdrr.io/r/utils/URLencode.html'>URLdecode</a></span><span class='o'>(</span><span class='o'>)</span> <span class='o'>|&gt;</span></span>
<span>  <span class='nf'><a href='http://xml2.r-lib.org/reference/read_xml.html'>read_html</a></span><span class='o'>(</span><span class='o'>)</span> <span class='o'>|&gt;</span></span>
<span>  <span class='nf'><a href='https://rvest.tidyverse.org/reference/html_text.html'>html_text</a></span><span class='o'>(</span><span class='o'>)</span></span>
<span></span>
<span><span class='nv'>overview_text</span></span>
<span><span class='c'>#&gt; [1] "100% Plant-Derived Squalane hydrates your skin while supporting its natural moisture barrier. Squalane is an exceptional hydrator found naturally in the skin, and this formula uses 100% plant-derived squalane derived from sugar cane for a non-comedogenic solution that enhances surface-level hydration.Our 100% Plant-Derived Squalane formula can also be used in hair to increase heat protection, add shine, and reduce breakage."</span></span>
<span></span></code></pre>

</div>

Although the above code does its job, it wasn't easy to figure out.

So now we're ready for the next steps: (i) get the links to all product pages and (ii) iterate over all those pages to extract the relevant information, just like we did with our example page.

#### Get the links to all product pages

To get the links to all the product pages, we'll first load the overview page that shows all the products.

Then we'll use [`html_nodes()`](https://rvest.tidyverse.org/reference/rename.html) to pull out all elements with the "product-link" class and grab the "href" attribute with `html_attr("href")`.

<div class="highlight">

<pre class='chroma'><code class='language-r' data-lang='r'><span><span class='nv'>my_url</span> <span class='o'>&lt;-</span> <span class='s'>"https://theordinary.com/en-de/category/skincare/serums"</span></span>
<span></span>
<span><span class='nv'>webpage</span> <span class='o'>&lt;-</span> <span class='nf'><a href='http://xml2.r-lib.org/reference/read_xml.html'>read_html</a></span><span class='o'>(</span><span class='nv'>my_url</span><span class='o'>)</span> </span>
<span></span>
<span><span class='nv'>webpage</span> <span class='o'>|&gt;</span></span>
<span>  <span class='nf'><a href='https://rvest.tidyverse.org/reference/rename.html'>html_nodes</a></span><span class='o'>(</span><span class='s'>".product-link"</span><span class='o'>)</span> <span class='o'>|&gt;</span></span>
<span>  <span class='nf'><a href='https://rvest.tidyverse.org/reference/html_attr.html'>html_attr</a></span><span class='o'>(</span><span class='s'>"href"</span><span class='o'>)</span></span>
<span><span class='c'>#&gt;  [1] "/en-de/niacinamide-10-zinc-1-serum-100436.html"            </span></span>
<span><span class='c'>#&gt;  [2] "/en-de/hyaluronic-acid-2-b5-serum-100425.html"             </span></span>
<span><span class='c'>#&gt;  [3] "/en-de/matrixyl-10-ha-serum-100431.html"                   </span></span>
<span><span class='c'>#&gt;  [4] "/en-de/multi-peptide-ha-serum-100613.html"                 </span></span>
<span><span class='c'>#&gt;  [5] "/en-de/buffet-copper-peptides-1-serum-100411.html"         </span></span>
<span><span class='c'>#&gt;  [6] "/en-de/argireline-solution-10-serum-100403.html"           </span></span>
<span><span class='c'>#&gt;  [7] "/en-de/multi-peptide-lash-brow-serum-100111.html"          </span></span>
<span><span class='c'>#&gt;  [8] "/en-de/marine-hyaluronics-serum-100430.html"               </span></span>
<span><span class='c'>#&gt;  [9] "/en-de/azelaic-acid-suspension-10-exfoliator-100407.html"  </span></span>
<span><span class='c'>#&gt; [10] "/en-de/granactive-retinoid-5-in-squalane-serum-100421.html"</span></span>
<span><span class='c'>#&gt; [11] "/en-de/amino-acids-b5-serum-100402.html"                   </span></span>
<span><span class='c'>#&gt; [12] "/en-de/granactive-retinoid-2-emulsion-serum-100419.html"</span></span>
<span></span></code></pre>

</div>

While this method does work, it only gets us 12 of the 31 skincare serums.

Turns out, the page uses dynamic loading. When we scroll to the bottom of the overview page, we need to hit the "load more" button to see more products.

To overcome this, we'll use the {RSelenium} package, which lets us "drive" a web browser right from within R, as if we were actually surfing the website.

Let's start by loading the package and firing up a selenium browser with the [`rsDriver()`](https://docs.ropensci.org/RSelenium/reference/rsDriver.html) function. I initially ran into some issues with Selenium, but setting the `chromever` attribute to `NULL` sorted it out as it stops adding the chrome browser to the Selenium Server.

<div class="highlight">

<pre class='chroma'><code class='language-r' data-lang='r'><span><span class='kr'><a href='https://rdrr.io/r/base/library.html'>library</a></span><span class='o'>(</span><span class='nv'><a href='https://docs.ropensci.org/RSelenium/'>RSelenium</a></span><span class='o'>)</span></span>
<span></span>
<span><span class='c'># Start a Selenium firefox browser</span></span>
<span><span class='nv'>driver</span> <span class='o'>&lt;-</span> <span class='nf'><a href='https://docs.ropensci.org/RSelenium/reference/rsDriver.html'>rsDriver</a></span><span class='o'>(</span>browser <span class='o'>=</span> <span class='s'>"firefox"</span>,</span>
<span>                   port <span class='o'>=</span> <span class='m'>4555L</span>,</span>
<span>                   verbose <span class='o'>=</span> <span class='kc'>FALSE</span>,</span>
<span>                   chromever <span class='o'>=</span> <span class='kc'>NULL</span><span class='o'>)</span></span></code></pre>

</div>

Next, we'll assign the client of our browser to an object, `remote_driver`, to make subsequent function calls easier to read. We set the URL to the overview page and head there with the `$navigate()` method.

<div class="highlight">

<pre class='chroma'><code class='language-r' data-lang='r'><span><span class='c'># extract the client for readability of the code to follow</span></span>
<span><span class='nv'>remote_driver</span> <span class='o'>&lt;-</span> <span class='nv'>driver</span><span class='o'>[[</span><span class='s'>"client"</span><span class='o'>]</span><span class='o'>]</span></span>
<span></span>
<span><span class='c'># Set URL</span></span>
<span><span class='nv'>url</span> <span class='o'>&lt;-</span> <span class='s'>"https://theordinary.com/en-de/category/skincare/serums"</span></span>
<span></span>
<span><span class='c'># Navigate to the webpage</span></span>
<span><span class='nv'>remote_driver</span><span class='o'>$</span><span class='nf'>navigate</span><span class='o'>(</span><span class='nv'>url</span><span class='o'>)</span></span></code></pre>

</div>

Since we're going to use Javascript to scroll to the bottom of the page, it's a good idea to first close all pop-ups and banners like the cookie consent banner and the newsletter sticky note.

To do this, we'll find the relevant button using the `$findElement()` method with a CSS selector and then click the button with the `$clickElement()` method.

<div class="highlight">

<pre class='chroma'><code class='language-r' data-lang='r'><span><span class='c'># find and click on cookie consent button</span></span>
<span><span class='nv'>cookie_button</span> <span class='o'>&lt;-</span> <span class='nv'>remote_driver</span><span class='o'>$</span><span class='nf'>findElement</span><span class='o'>(</span>using <span class='o'>=</span> <span class='s'>"css selector"</span>, <span class='s'>"button.js-cookie_consent-btn"</span><span class='o'>)</span></span>
<span><span class='nv'>cookie_button</span><span class='o'>$</span><span class='nf'>clickElement</span><span class='o'>(</span><span class='o'>)</span></span>
<span></span>
<span><span class='c'># find and close newsletter sticky note</span></span>
<span><span class='nv'>close_sticknote_button</span> <span class='o'>&lt;-</span> <span class='nv'>remote_driver</span><span class='o'>$</span><span class='nf'>findElement</span><span class='o'>(</span>using <span class='o'>=</span> <span class='s'>"css selector"</span>, <span class='s'>"button.page_footer_newsletter_sticky_close"</span><span class='o'>)</span></span>
<span><span class='nv'>close_sticknote_button</span><span class='o'>$</span><span class='nf'>clickElement</span><span class='o'>(</span><span class='o'>)</span></span></code></pre>

</div>

When manually scrolling through the page, we have to hit the "load more" button a few times. To automate this, we first create a function, `load_more()`, which uses Javascript to scroll to the end of the page with the `$executeScript` method. Then we find the "load more" button with `$findElement()` and click the button. Finally, we give the website a moment to respond.

<div class="highlight">

<pre class='chroma'><code class='language-r' data-lang='r'><span><span class='nv'>load_more</span> <span class='o'>&lt;-</span> <span class='kr'>function</span><span class='o'>(</span><span class='nv'>rd</span><span class='o'>)</span> <span class='o'>&#123;</span></span>
<span>  <span class='c'># scroll to end of page</span></span>
<span>  <span class='nv'>rd</span><span class='o'>$</span><span class='nf'>executeScript</span><span class='o'>(</span><span class='s'>"window.scrollTo(0, document.body.scrollHeight);"</span>, args <span class='o'>=</span> <span class='nf'><a href='https://rdrr.io/r/base/list.html'>list</a></span><span class='o'>(</span><span class='o'>)</span><span class='o'>)</span></span>
<span>  <span class='c'># Find the "Load more" button by its CSS selector and ...</span></span>
<span>  <span class='nv'>load_more_button</span> <span class='o'>&lt;-</span> <span class='nv'>rd</span><span class='o'>$</span><span class='nf'>findElement</span><span class='o'>(</span>using <span class='o'>=</span> <span class='s'>"css selector"</span>, <span class='s'>"button.btn-load.more"</span><span class='o'>)</span></span>
<span>  <span class='c'># ... click it</span></span>
<span>  <span class='nv'>load_more_button</span><span class='o'>$</span><span class='nf'>clickElement</span><span class='o'>(</span><span class='o'>)</span></span>
<span>  <span class='c'># give the website a moment to respond</span></span>
<span>  <span class='nf'><a href='https://rdrr.io/r/base/Sys.sleep.html'>Sys.sleep</a></span><span class='o'>(</span><span class='m'>5</span><span class='o'>)</span></span>
<span><span class='o'>&#125;</span></span></code></pre>

</div>

How many times do we need to scroll and hit "load more"? Basically, until the button is no longer displayed. If this happens, the `load_more()` function would throw an error, since `$findElement()` wouldn't find a button with the class `"btn-load.more"`.

We can leverage this to create a recursive function `load_page_completely()`. Using [`tryCatch()`](https://rdrr.io/r/base/conditions.html), we "try" to load more content, and if this works, we call `load_page_completely()` again using [`Recall()`](https://rdrr.io/r/base/Recall.html). If `load_more()` throws an error we let `load_page_completely()` return nothing (`NULL`).

<div class="highlight">

<pre class='chroma'><code class='language-r' data-lang='r'><span><span class='nv'>load_page_completely</span> <span class='o'>&lt;-</span> <span class='kr'>function</span><span class='o'>(</span><span class='nv'>rd</span><span class='o'>)</span> <span class='o'>&#123;</span></span>
<span>  <span class='c'># load more content even if it throws an error</span></span>
<span>  <span class='kr'><a href='https://rdrr.io/r/base/conditions.html'>tryCatch</a></span><span class='o'>(</span><span class='o'>&#123;</span></span>
<span>    <span class='c'># call load_more()</span></span>
<span>    <span class='nf'>load_more</span><span class='o'>(</span><span class='nv'>rd</span><span class='o'>)</span></span>
<span>    <span class='c'># if no error is thrown, call the load_page_completely() function again</span></span>
<span>    <span class='nf'><a href='https://rdrr.io/r/base/Recall.html'>Recall</a></span><span class='o'>(</span><span class='nv'>rd</span><span class='o'>)</span></span>
<span>  <span class='o'>&#125;</span>, error <span class='o'>=</span> <span class='kr'>function</span><span class='o'>(</span><span class='nv'>e</span><span class='o'>)</span> <span class='o'>&#123;</span></span>
<span>    <span class='c'># if an error is thrown return nothing / NULL</span></span>
<span>  <span class='o'>&#125;</span><span class='o'>)</span></span>
<span><span class='o'>&#125;</span></span></code></pre>

</div>

To get this recursive function into action, we call it and provide our browser client `remote_driver` as an input:

<div class="highlight">

<pre class='chroma'><code class='language-r' data-lang='r'><span><span class='nf'>load_page_completely</span><span class='o'>(</span><span class='nv'>remote_driver</span><span class='o'>)</span></span>
<span><span class='c'>#&gt; NULL</span></span>
<span></span></code></pre>

</div>

Now the source code of the product overview page should feature all 31 serums. We use the `$getPageSource()` function, which produces a list where the first element `[[1]]` contains the HTML of the current page. We can resume the {rvest} workflow by reading in the html with [`read_html()`](http://xml2.r-lib.org/reference/read_xml.html) and extracting the links of all element with the class "product-link". Since the links are relative we have to add the full path with [`paste0()`](https://rdrr.io/r/base/paste.html):

<div class="highlight">

<pre class='chroma'><code class='language-r' data-lang='r'><span><span class='c'># Now we get the page source and use rvest to parse it</span></span>
<span><span class='nv'>page_source</span> <span class='o'>&lt;-</span> <span class='nv'>remote_driver</span><span class='o'>$</span><span class='nf'>getPageSource</span><span class='o'>(</span><span class='o'>)</span><span class='o'>[[</span><span class='m'>1</span><span class='o'>]</span><span class='o'>]</span></span>
<span><span class='nv'>webpage</span> <span class='o'>&lt;-</span> <span class='nf'><a href='http://xml2.r-lib.org/reference/read_xml.html'>read_html</a></span><span class='o'>(</span><span class='nv'>page_source</span><span class='o'>)</span></span>
<span></span>
<span><span class='c'># Use CSS selectors to scrape the links</span></span>
<span><span class='nv'>product_links</span> <span class='o'>&lt;-</span> <span class='nv'>webpage</span> <span class='o'>|&gt;</span></span>
<span>  <span class='nf'><a href='https://rvest.tidyverse.org/reference/rename.html'>html_nodes</a></span><span class='o'>(</span><span class='s'>".product-link"</span><span class='o'>)</span> <span class='o'>|&gt;</span></span>
<span>  <span class='nf'><a href='https://rvest.tidyverse.org/reference/html_attr.html'>html_attr</a></span><span class='o'>(</span><span class='s'>"href"</span><span class='o'>)</span></span>
<span></span>
<span><span class='nv'>full_product_links</span> <span class='o'>&lt;-</span> <span class='nf'><a href='https://rdrr.io/r/base/paste.html'>paste0</a></span><span class='o'>(</span><span class='s'>"https://theordinary.com"</span>, <span class='nv'>product_links</span><span class='o'>)</span></span>
<span><span class='nf'><a href='https://rdrr.io/r/utils/str.html'>str</a></span><span class='o'>(</span><span class='nv'>full_product_links</span><span class='o'>)</span></span>
<span><span class='c'>#&gt;  chr [1:31] "https://theordinary.com/en-de/niacinamide-10-zinc-1-serum-100436.html" ...</span></span>
<span></span></code></pre>

</div>

We've been successful! The result is a character vector of links with 31 elements.

#### Piecing everything together

With all the elements in place, it's time to bring everything together. We have a couple of tasks to take care of.

First, we'll wrap the content extraction from a single product page into a function we'll call `retrieve_info()`. This function extracts all relevant information from one product page and returns them in the form of a `tibble`.

<div class="highlight">

<pre class='chroma'><code class='language-r' data-lang='r'><span><span class='kr'><a href='https://rdrr.io/r/base/library.html'>library</a></span><span class='o'>(</span><span class='nv'><a href='https://dplyr.tidyverse.org'>dplyr</a></span><span class='o'>)</span></span>
<span></span>
<span><span class='nv'>retrieve_info</span> <span class='o'>&lt;-</span> <span class='kr'>function</span><span class='o'>(</span><span class='nv'>url</span><span class='o'>)</span> <span class='o'>&#123;</span></span>
<span></span>
<span>  <span class='nv'>webpage</span> <span class='o'>&lt;-</span> <span class='nf'><a href='http://xml2.r-lib.org/reference/read_xml.html'>read_html</a></span><span class='o'>(</span><span class='nv'>url</span><span class='o'>)</span></span>
<span></span>
<span>  <span class='nv'>product_name</span> <span class='o'>&lt;-</span> <span class='nv'>webpage</span> <span class='o'>|&gt;</span></span>
<span>    <span class='nf'><a href='https://rvest.tidyverse.org/reference/html_element.html'>html_element</a></span><span class='o'>(</span><span class='s'>"h1.product-name&gt;span.sr-only"</span><span class='o'>)</span> <span class='o'>|&gt;</span></span>
<span>    <span class='nf'><a href='https://rvest.tidyverse.org/reference/html_text.html'>html_text</a></span><span class='o'>(</span><span class='o'>)</span></span>
<span></span>
<span>  <span class='nv'>skin_concern</span> <span class='o'>&lt;-</span> <span class='nv'>webpage</span> <span class='o'>|&gt;</span></span>
<span>    <span class='nf'>html_element_to_text</span><span class='o'>(</span><span class='s'>"p.skin-concern.panel-item"</span>,</span>
<span>                         <span class='s'>"^Targets "</span><span class='o'>)</span></span>
<span></span>
<span>  <span class='nv'>suited_to</span> <span class='o'>&lt;-</span> <span class='nv'>webpage</span> <span class='o'>|&gt;</span></span>
<span>    <span class='nf'>html_element_to_text</span><span class='o'>(</span><span class='s'>"p.suitedTo.panel-item"</span>,</span>
<span>                         <span class='s'>"^Suited to "</span><span class='o'>)</span></span>
<span></span>
<span>  <span class='nv'>format</span> <span class='o'>&lt;-</span> <span class='nv'>webpage</span> <span class='o'>|&gt;</span></span>
<span>    <span class='nf'>html_element_to_text</span><span class='o'>(</span><span class='s'>"p.format.panel-item"</span>,</span>
<span>                         <span class='s'>"^Format "</span><span class='o'>)</span></span>
<span></span>
<span>  <span class='nv'>when_to_use_good_for</span> <span class='o'>&lt;-</span> <span class='nv'>webpage</span> <span class='o'>|&gt;</span></span>
<span>    <span class='nf'>html_element_to_text</span><span class='o'>(</span><span class='s'>"div.content.when-to-use"</span>,</span>
<span>                         <span class='s'>"^When to use "</span><span class='o'>)</span></span>
<span></span>
<span>  <span class='nv'>do_not_use</span> <span class='o'>&lt;-</span> <span class='nv'>webpage</span> <span class='o'>|&gt;</span></span>
<span>    <span class='nf'>html_element_to_text</span><span class='o'>(</span><span class='s'>"div.content.do-not-use"</span>,</span>
<span>                         <span class='s'>"^Do not use "</span><span class='o'>)</span></span>
<span></span>
<span>  <span class='nv'>when_to_use</span> <span class='o'>&lt;-</span> <span class='nf'><a href='https://stringr.tidyverse.org/reference/str_extract.html'>str_extract</a></span><span class='o'>(</span><span class='nv'>when_to_use_good_for</span>, <span class='s'>".*(?= Good for)"</span><span class='o'>)</span></span>
<span>  <span class='nv'>good_for</span> <span class='o'>&lt;-</span> <span class='nf'><a href='https://stringr.tidyverse.org/reference/str_extract.html'>str_extract</a></span><span class='o'>(</span><span class='nv'>when_to_use_good_for</span>, <span class='s'>"(?&lt;=Good for ).*"</span><span class='o'>)</span></span>
<span></span>
<span>  <span class='nv'>overview_text</span> <span class='o'>&lt;-</span> <span class='nv'>webpage</span> <span class='o'>|&gt;</span></span>
<span>    <span class='nf'><a href='https://rvest.tidyverse.org/reference/html_element.html'>html_element</a></span><span class='o'>(</span><span class='s'>"#overview-about-text"</span><span class='o'>)</span> <span class='o'>|&gt;</span></span>
<span>    <span class='nf'><a href='https://rvest.tidyverse.org/reference/html_attr.html'>html_attr</a></span><span class='o'>(</span><span class='s'>"value"</span><span class='o'>)</span> <span class='o'>|&gt;</span></span>
<span>    <span class='nf'><a href='https://rdrr.io/r/utils/URLencode.html'>URLdecode</a></span><span class='o'>(</span><span class='o'>)</span> <span class='o'>|&gt;</span></span>
<span>    <span class='nf'><a href='http://xml2.r-lib.org/reference/read_xml.html'>read_html</a></span><span class='o'>(</span><span class='o'>)</span> <span class='o'>|&gt;</span></span>
<span>    <span class='nf'><a href='https://rvest.tidyverse.org/reference/html_text.html'>html_text</a></span><span class='o'>(</span><span class='o'>)</span></span>
<span></span>
<span>  <span class='nf'><a href='https://tibble.tidyverse.org/reference/tibble.html'>tibble</a></span><span class='o'>(</span>product_name <span class='o'>=</span> <span class='nv'>product_name</span>,</span>
<span>         target <span class='o'>=</span> <span class='nv'>skin_concern</span>,</span>
<span>         suited_to <span class='o'>=</span> <span class='nv'>suited_to</span>,</span>
<span>         format <span class='o'>=</span> <span class='nv'>format</span>,</span>
<span>         about <span class='o'>=</span> <span class='nv'>overview_text</span>,</span>
<span>         when_to_use <span class='o'>=</span> <span class='nv'>when_to_use</span>,</span>
<span>         good_for <span class='o'>=</span> <span class='nv'>good_for</span>,</span>
<span>         do_not_use <span class='o'>=</span> <span class='nv'>do_not_use</span></span>
<span>  <span class='o'>)</span></span>
<span></span>
<span><span class='o'>&#125;</span></span></code></pre>

</div>

Next, we'll use the {purrr} package to iterate over all the product links, retrieve the info from each page, and bind the resulting list of tibbles into a single `tibble` using [`list_rbind()`](https://purrr.tidyverse.org/reference/list_c.html):

<div class="highlight">

<pre class='chroma'><code class='language-r' data-lang='r'><span><span class='kr'><a href='https://rdrr.io/r/base/library.html'>library</a></span><span class='o'>(</span><span class='nv'><a href='https://purrr.tidyverse.org/'>purrr</a></span><span class='o'>)</span></span>
<span></span>
<span><span class='nv'>final_tbl</span> <span class='o'>&lt;-</span> <span class='nf'><a href='https://purrr.tidyverse.org/reference/map.html'>map</a></span><span class='o'>(</span><span class='nv'>full_product_links</span>, <span class='nv'>retrieve_info</span><span class='o'>)</span> <span class='o'>|&gt;</span></span>
<span>  <span class='nf'><a href='https://purrr.tidyverse.org/reference/list_c.html'>list_rbind</a></span><span class='o'>(</span><span class='o'>)</span></span></code></pre>

</div>

Finally, we save the `tibble` as an Excel table with filters using [`openxlsx::write.xlsx()`](https://rdrr.io/pkg/openxlsx/man/write.xlsx.html):

<div class="highlight">

<pre class='chroma'><code class='language-r' data-lang='r'><span><span class='nf'>openxlsx</span><span class='nf'>::</span><span class='nf'><a href='https://rdrr.io/pkg/openxlsx/man/write.xlsx.html'>write.xlsx</a></span><span class='o'>(</span><span class='nv'>final_tbl</span>, <span class='s'>"ordinary_serums.xlsx"</span>,</span>
<span>                     asTable <span class='o'>=</span> <span class='kc'>TRUE</span><span class='o'>)</span></span></code></pre>

</div>

If you don't want to execute the code above, you can look at the results in this Excel file: <a href="ordinary_serums.xlsx" role="highlight" target="_blank">ordinary_serums.xlsx</a>

## Wrap-up

That's it. We started with some very basic static web scraping and moved on to more complex tasks involving reading URL-encoded hidden input fields and crafting recursive functions to load more content on dynamic websites.

I hope you enjoyed the post. If you have a better approach to one of the examples above, or if you have any kind of feedback let me know in the comments below or via Twitter, Mastodon or Github.

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
<span><span class='c'>#&gt;  date     2023-05-31</span></span>
<span><span class='c'>#&gt;  pandoc   2.19.2 @ /Applications/RStudio.app/Contents/MacOS/quarto/bin/tools/ (via rmarkdown)</span></span>
<span><span class='c'>#&gt; </span></span>
<span><span class='c'>#&gt; <span style='color: #00BBBB; font-weight: bold;'>─ Packages ───────────────────────────────────────────────────────────────────</span></span></span>
<span><span class='c'>#&gt;  <span style='color: #555555; font-style: italic;'>package  </span> <span style='color: #555555; font-style: italic;'>*</span> <span style='color: #555555; font-style: italic;'>version</span> <span style='color: #555555; font-style: italic;'>date (UTC)</span> <span style='color: #555555; font-style: italic;'>lib</span> <span style='color: #555555; font-style: italic;'>source</span></span></span>
<span><span class='c'>#&gt;  dplyr     * 1.1.0   <span style='color: #555555;'>2023-01-29</span> <span style='color: #555555;'>[1]</span> <span style='color: #555555;'>CRAN (R 4.2.0)</span></span></span>
<span><span class='c'>#&gt;  purrr     * 1.0.1   <span style='color: #555555;'>2023-01-10</span> <span style='color: #555555;'>[1]</span> <span style='color: #555555;'>CRAN (R 4.2.0)</span></span></span>
<span><span class='c'>#&gt;  RSelenium * 1.7.9   <span style='color: #555555;'>2022-09-02</span> <span style='color: #555555;'>[1]</span> <span style='color: #555555;'>CRAN (R 4.2.0)</span></span></span>
<span><span class='c'>#&gt;  rvest     * 1.0.3   <span style='color: #555555;'>2022-08-19</span> <span style='color: #555555;'>[1]</span> <span style='color: #555555;'>CRAN (R 4.2.0)</span></span></span>
<span><span class='c'>#&gt;  stringr   * 1.5.0   <span style='color: #555555;'>2022-12-02</span> <span style='color: #555555;'>[1]</span> <span style='color: #555555;'>CRAN (R 4.2.0)</span></span></span>
<span><span class='c'>#&gt;  tidyr     * 1.2.1   <span style='color: #555555;'>2022-09-08</span> <span style='color: #555555;'>[1]</span> <span style='color: #555555;'>CRAN (R 4.2.0)</span></span></span>
<span><span class='c'>#&gt; </span></span>
<span><span class='c'>#&gt; <span style='color: #555555;'> [1] /Library/Frameworks/R.framework/Versions/4.2/Resources/library</span></span></span>
<span><span class='c'>#&gt; </span></span>
<span><span class='c'>#&gt; <span style='color: #00BBBB; font-weight: bold;'>──────────────────────────────────────────────────────────────────────────────</span></span></span>
<span></span></code></pre>

</div>

</details>

</div>

