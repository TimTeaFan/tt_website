---
output:
  hugodownplus::md_document:
    use_boxes: TRUE
    toc: TRUE
# Documentation: https://sourcethemes.com/academic/docs/managing-content/

title: "Using a Data Dictionary to Recode Columns with dplyr"
subtitle: ""
summary: "This blog provides an in-depth tutorial on using dplyr to recode and rename multiple columns according to a data dictionary."
authors: []
tags: ["R", "dplyr", "recode"]
categories: ["R", "dplyr", "recode"]
date: 2023-06-30
lastmod: 2023-06-30
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
rmd_hash: 017b9ba3f65ac87e

---

-   <a href="#intro" id="toc-intro">Intro</a>
-   <a href="#recoding-one-dataset" id="toc-recoding-one-dataset">Recoding one dataset</a>
-   <a href="#recoding-many-datasets" id="toc-recoding-many-datasets">Recoding many datasets</a>
-   <a href="#final-thoughts" id="toc-final-thoughts">Final Thoughts</a>

## Intro

Today's blog post is all about recoding columns using a data dictionary and [`dplyr::recode()`](https://dplyr.tidyverse.org/reference/recode.html).

Many datasets, especially from surveys, come along with a proper documentation often in form of a so called "data dictionary". A data dictionary contains at least three pieces of information: the (i) column names that are used in the dataset as well as corresponding (ii) numeric values and (iii) labels which translate those abstract numbers into meaningful terms.

At times, you may need to transform the raw values into their associated labels for tasks like reporting or plotting. Here, [`dplyr::recode()`](https://dplyr.tidyverse.org/reference/recode.html) serves as an efficient tool to programmatically recode, and also rename, columns according to a data dictionary.

Recently I revamped an old ETL script I had written, which recoded multiple datasets based on a data dictionary. This script was from the pre-dplyr 1.0 era, so updating it provided a great opportunity to revisit this task, this time armed with the latest dplyr version. The resulting approach was such a significant improvement over my original method, that I felt compelled to share it here, serving as both a personal reference and a resource for anyone confronted with similar challenges.

We'll start with a straightforward example to demonstrate the basic workflow. We then look at a more advanced scenario involving multiple datasets and a comprehensive data dictionary. Lastly, this blog concludes with some thoughts about the recent changes in dplyr version 1.1.0 and `recode`'s new successor [`case_match()`](https://dplyr.tidyverse.org/reference/case_match.html).

## Recoding one dataset

#### Setup

Lets start with a really simple dataset composed of three columms and fives rows:

<div class="highlight">

<pre class='chroma'><code class='language-r' data-lang='r'><span><span class='kr'><a href='https://rdrr.io/r/base/library.html'>library</a></span><span class='o'>(</span><span class='nv'><a href='https://dplyr.tidyverse.org'>dplyr</a></span><span class='o'>)</span></span>
<span></span>
<span><span class='c'># dataset</span></span>
<span><span class='nv'>dat</span> <span class='o'>&lt;-</span> <span class='nf'><a href='https://tibble.tidyverse.org/reference/tibble.html'>tibble</a></span><span class='o'>(</span>a <span class='o'>=</span> <span class='m'>1</span><span class='o'>:</span><span class='m'>5</span>,</span>
<span>              b <span class='o'>=</span> <span class='nf'><a href='https://rdrr.io/r/base/c.html'>c</a></span><span class='o'>(</span><span class='m'>10</span><span class='o'>:</span><span class='m'>14</span><span class='o'>)</span>,</span>
<span>              c <span class='o'>=</span> <span class='nf'><a href='https://rdrr.io/r/base/c.html'>c</a></span><span class='o'>(</span><span class='m'>20</span><span class='o'>:</span><span class='m'>24</span><span class='o'>)</span><span class='o'>)</span></span>
<span><span class='nv'>dat</span></span>
<span><span class='c'>#&gt; <span style='color: #555555;'># A tibble: 5 × 3</span></span></span>
<span><span class='c'>#&gt;       a     b     c</span></span>
<span><span class='c'>#&gt;   <span style='color: #555555; font-style: italic;'>&lt;int&gt;</span> <span style='color: #555555; font-style: italic;'>&lt;int&gt;</span> <span style='color: #555555; font-style: italic;'>&lt;int&gt;</span></span></span>
<span><span class='c'>#&gt; <span style='color: #555555;'>1</span>     1    10    20</span></span>
<span><span class='c'>#&gt; <span style='color: #555555;'>2</span>     2    11    21</span></span>
<span><span class='c'>#&gt; <span style='color: #555555;'>3</span>     3    12    22</span></span>
<span><span class='c'>#&gt; <span style='color: #555555;'>4</span>     4    13    23</span></span>
<span><span class='c'>#&gt; <span style='color: #555555;'>5</span>     5    14    24</span></span>
<span></span></code></pre>

</div>

Assume we have a data dictionary that looks like this:

<div class="highlight">

<pre class='chroma'><code class='language-r' data-lang='r'><span><span class='c'># dictionary</span></span>
<span><span class='nv'>dat_dict</span> <span class='o'>&lt;-</span> <span class='nf'><a href='https://tibble.tidyverse.org/reference/tibble.html'>tibble</a></span><span class='o'>(</span></span>
<span>  </span>
<span>  col_nm <span class='o'>=</span> <span class='nf'><a href='https://rdrr.io/r/base/c.html'>c</a></span><span class='o'>(</span></span>
<span>    <span class='nf'><a href='https://rdrr.io/r/base/rep.html'>rep</a></span><span class='o'>(</span><span class='s'>"b"</span>, <span class='m'>5</span><span class='o'>)</span>,</span>
<span>    <span class='nf'><a href='https://rdrr.io/r/base/rep.html'>rep</a></span><span class='o'>(</span><span class='s'>"c"</span>, <span class='m'>5</span><span class='o'>)</span></span>
<span>  <span class='o'>)</span>,</span>
<span>  </span>
<span>  value <span class='o'>=</span> <span class='nf'><a href='https://rdrr.io/r/base/c.html'>c</a></span><span class='o'>(</span></span>
<span>    <span class='m'>10</span><span class='o'>:</span><span class='m'>14</span>,</span>
<span>    <span class='m'>20</span><span class='o'>:</span><span class='m'>24</span></span>
<span>  <span class='o'>)</span>,</span>
<span>  </span>
<span>  label <span class='o'>=</span> <span class='nf'><a href='https://rdrr.io/r/base/c.html'>c</a></span><span class='o'>(</span></span>
<span>    <span class='nv'>letters</span><span class='o'>[</span><span class='m'>1</span><span class='o'>:</span><span class='m'>5</span><span class='o'>]</span>,</span>
<span>    <span class='nv'>letters</span><span class='o'>[</span><span class='m'>6</span><span class='o'>:</span><span class='m'>10</span><span class='o'>]</span></span>
<span>  <span class='o'>)</span></span>
<span><span class='o'>)</span></span>
<span></span>
<span><span class='nv'>dat_dict</span></span>
<span><span class='c'>#&gt; <span style='color: #555555;'># A tibble: 10 × 3</span></span></span>
<span><span class='c'>#&gt;    col_nm value label</span></span>
<span><span class='c'>#&gt;    <span style='color: #555555; font-style: italic;'>&lt;chr&gt;</span>  <span style='color: #555555; font-style: italic;'>&lt;int&gt;</span> <span style='color: #555555; font-style: italic;'>&lt;chr&gt;</span></span></span>
<span><span class='c'>#&gt; <span style='color: #555555;'> 1</span> b         10 a    </span></span>
<span><span class='c'>#&gt; <span style='color: #555555;'> 2</span> b         11 b    </span></span>
<span><span class='c'>#&gt; <span style='color: #555555;'> 3</span> b         12 c    </span></span>
<span><span class='c'>#&gt; <span style='color: #555555;'> 4</span> b         13 d    </span></span>
<span><span class='c'>#&gt; <span style='color: #555555;'> 5</span> b         14 e    </span></span>
<span><span class='c'>#&gt; <span style='color: #555555;'> 6</span> c         20 f    </span></span>
<span><span class='c'>#&gt; <span style='color: #555555;'> 7</span> c         21 g    </span></span>
<span><span class='c'>#&gt; <span style='color: #555555;'> 8</span> c         22 h    </span></span>
<span><span class='c'>#&gt; <span style='color: #555555;'> 9</span> c         23 i    </span></span>
<span><span class='c'>#&gt; <span style='color: #555555;'>10</span> c         24 j</span></span>
<span></span></code></pre>

</div>

The dictionary has three columns: `col_nm` records our dataset's column names, `value` holds the values, as seen in our raw data `dat`, and `label` stores the corresponding labels.

Note, that our dataset contains a column `a` that is not part of the data dictionary, just to show that the dictionary doesn't need to hold value-label pairs for all columns.

Typically, attached data dictionaries come in form of csv or xlsx files, but after reading them into R, they should be in a similar form as our mock dictionary above.

#### Preparations

Next, we need to prepare two things: (i) a custom function to recode a **single** column according to the dictionary and (ii) a vector of columns names we want to recode. We will then use both inside `dplyr::mutate(across(...))`.

Taking a closer look at our custom recode function, it accepts the column to recode, `x`, as its only argument. The function works in two steps. Initially, we create a named vector of matching label-value pairs. Next, we splice this vector as arguments into `dplyr::recode(x, ...)` using rlang's triple bang operator `!!!`.

<div class="highlight">

<pre class='chroma'><code class='language-r' data-lang='r'><span><span class='c'># recode function to be used within `dplyr::mutate(across(...))`</span></span>
<span><span class='nv'>recode_col</span> <span class='o'>&lt;-</span> <span class='kr'>function</span><span class='o'>(</span><span class='nv'>x</span><span class='o'>)</span> <span class='o'>&#123;</span></span>
<span>  </span>
<span>  <span class='nv'>recode_vec</span> <span class='o'>&lt;-</span> <span class='nv'>dat_dict</span> <span class='o'>|&gt;</span></span>
<span>    <span class='nf'><a href='https://dplyr.tidyverse.org/reference/filter.html'>filter</a></span><span class='o'>(</span><span class='nv'>col_nm</span> <span class='o'>==</span> <span class='nf'><a href='https://dplyr.tidyverse.org/reference/context.html'>cur_column</a></span><span class='o'>(</span><span class='o'>)</span><span class='o'>)</span> <span class='o'>|&gt;</span></span>
<span>    <span class='nf'><a href='https://dplyr.tidyverse.org/reference/pull.html'>pull</a></span><span class='o'>(</span><span class='nv'>label</span>, name <span class='o'>=</span> <span class='nv'>value</span><span class='o'>)</span></span>
<span>  </span>
<span>  <span class='nf'>dplyr</span><span class='nf'>::</span><span class='nf'><a href='https://dplyr.tidyverse.org/reference/recode.html'>recode</a></span><span class='o'>(</span><span class='nv'>x</span>, <span class='o'>!</span><span class='o'>!</span><span class='o'>!</span> <span class='nv'>recode_vec</span><span class='o'>)</span></span>
<span><span class='o'>&#125;</span></span></code></pre>

</div>

To create a named vector of matching label-value pairs we start with our data dictionary `dat_dict`. We filter the current column using [`cur_column()`](https://dplyr.tidyverse.org/reference/context.html), which is possible since we're going use this function inside [`dplyr::across()`](https://dplyr.tidyverse.org/reference/across.html) where [`cur_column()`](https://dplyr.tidyverse.org/reference/context.html) yields us the string name of the current column. Finally, we use `pull(label, name = value)` to get the labels as character vector, along with their matching values as names.

In the final step of our custom function, we "splice" this named vector of label-value pairs into [`dplyr::recode()`](https://dplyr.tidyverse.org/reference/recode.html). Despite "splicing" sounding rather technical, it's essentially an early evaluation. We evaluate the vector `recode_vec` prior to processing the [`dplyr::recode()`](https://dplyr.tidyverse.org/reference/recode.html) call. Assume we want to recode column `b` in `dat` and `recode_vec` looks like this:

<div class="highlight">

<pre class='chroma'><code class='language-r' data-lang='r'><span><span class='nv'>recode_vec</span> <span class='o'>&lt;-</span> <span class='nf'><a href='https://rdrr.io/r/base/c.html'>c</a></span><span class='o'>(</span><span class='s'>"10"</span> <span class='o'>=</span> <span class='s'>"a"</span>, <span class='s'>"11"</span> <span class='o'>=</span> <span class='s'>"b"</span>, <span class='s'>"12"</span> <span class='o'>=</span> <span class='s'>"c"</span>, <span class='s'>"13"</span> <span class='o'>=</span> <span class='s'>"d"</span>, <span class='s'>"14"</span> <span class='o'>=</span> <span class='s'>"e"</span><span class='o'>)</span></span></code></pre>

</div>

Then ...

<div class="highlight">

<pre class='chroma'><code class='language-r' data-lang='r'><span><span class='nf'>dplyr</span><span class='nf'>::</span><span class='nf'><a href='https://dplyr.tidyverse.org/reference/recode.html'>recode</a></span><span class='o'>(</span><span class='nv'>x</span>, <span class='o'>!</span><span class='o'>!</span><span class='o'>!</span> <span class='nv'>recode_vec</span><span class='o'>)</span></span></code></pre>

</div>

... becomes:

<div class="highlight">

<pre class='chroma'><code class='language-r' data-lang='r'><span><span class='nf'>dplyr</span><span class='nf'>::</span><span class='nf'><a href='https://dplyr.tidyverse.org/reference/recode.html'>recode</a></span><span class='o'>(</span><span class='nv'>x</span>, <span class='nf'><a href='https://rdrr.io/r/base/c.html'>c</a></span><span class='o'>(</span><span class='s'>"10"</span> <span class='o'>=</span> <span class='s'>"a"</span>, <span class='s'>"11"</span> <span class='o'>=</span> <span class='s'>"b"</span>, <span class='s'>"12"</span> <span class='o'>=</span> <span class='s'>"c"</span>, <span class='s'>"13"</span> <span class='o'>=</span> <span class='s'>"d"</span>, <span class='s'>"14"</span> <span class='o'>=</span> <span class='s'>"e"</span><span class='o'>)</span><span class='o'>)</span></span></code></pre>

</div>

Keep in mind, we're presuming hat the data dictionary is available in the global environment, and that our dataset `dat` doesn't contain a column with an identical name as our data dictionary `dat_dict`. We can bolster the safety of our approach by supplying the data dictionary as a second argument to our `recode_col()` function. For interested readers this is shown in the info box below.

<div class="info-box" title="Expand: External inputs to custom functions used in `across`">

If we want to make sure that our `recode_col()` function uses the correct dictionary then we can supply it as second argument:

<div class="highlight">

<pre class='chroma'><code class='language-r' data-lang='r'><span><span class='c'># recode function to be used within `dplyr::mutate(across(...))`</span></span>
<span><span class='nv'>recode_col_safe</span> <span class='o'>&lt;-</span> <span class='kr'>function</span><span class='o'>(</span><span class='nv'>x</span>, <span class='nv'>dict</span><span class='o'>)</span> <span class='o'>&#123;</span></span>
<span>  </span>
<span>  <span class='nv'>recode_vec</span> <span class='o'>&lt;-</span> <span class='nv'>dict</span> <span class='o'>|&gt;</span></span>
<span>    <span class='nf'><a href='https://dplyr.tidyverse.org/reference/filter.html'>filter</a></span><span class='o'>(</span><span class='nv'>col_nm</span> <span class='o'>==</span> <span class='nf'><a href='https://dplyr.tidyverse.org/reference/context.html'>cur_column</a></span><span class='o'>(</span><span class='o'>)</span><span class='o'>)</span> <span class='o'>|&gt;</span></span>
<span>    <span class='nf'><a href='https://dplyr.tidyverse.org/reference/pull.html'>pull</a></span><span class='o'>(</span><span class='nv'>label</span>, name <span class='o'>=</span> <span class='nv'>value</span><span class='o'>)</span></span>
<span>  </span>
<span>  <span class='nf'>dplyr</span><span class='nf'>::</span><span class='nf'><a href='https://dplyr.tidyverse.org/reference/recode.html'>recode</a></span><span class='o'>(</span><span class='nv'>x</span>, <span class='o'>!</span><span class='o'>!</span><span class='o'>!</span> <span class='nv'>recode_vec</span><span class='o'>)</span></span>
<span><span class='o'>&#125;</span></span></code></pre>

</div>

In that case, it is not enough to only supply the bare function `recode_col` to `across`. We need to create an anonymous function `\(x, dic) ...` that calls `recode_col`. Here we can use `.env$dat_dict` to tell dplyr to look for an object `dat_dict` in a parent environment (and not inside our data.frame). This would prevent an error in case our data would contain an column with the same name as our data dictionary `dat_dict`.

<div class="highlight">

<pre class='chroma'><code class='language-r' data-lang='r'><span><span class='c'># vector of columns to recode</span></span>
<span><span class='nv'>cols_vec</span> <span class='o'>&lt;-</span> <span class='nf'><a href='https://rdrr.io/r/base/unique.html'>unique</a></span><span class='o'>(</span><span class='nv'>dat_dict</span><span class='o'>$</span><span class='nv'>col_nm</span><span class='o'>)</span></span>
<span></span>
<span><span class='c'># recoding defined columns</span></span>
<span><span class='nv'>dat</span> <span class='o'>|&gt;</span> </span>
<span>  <span class='nf'><a href='https://dplyr.tidyverse.org/reference/mutate.html'>mutate</a></span><span class='o'>(</span><span class='nf'><a href='https://dplyr.tidyverse.org/reference/across.html'>across</a></span><span class='o'>(</span><span class='nf'><a href='https://tidyselect.r-lib.org/reference/all_of.html'>all_of</a></span><span class='o'>(</span><span class='nv'>cols_vec</span><span class='o'>)</span>,</span>
<span>                \<span class='o'>(</span><span class='nv'>x</span>, <span class='nv'>dic</span><span class='o'>)</span> <span class='nf'>recode_col_safe</span><span class='o'>(</span><span class='nv'>x</span>, <span class='nv'>.env</span><span class='o'>$</span><span class='nv'>dat_dict</span><span class='o'>)</span><span class='o'>)</span></span>
<span>  <span class='o'>)</span></span>
<span><span class='c'>#&gt; <span style='color: #555555;'># A tibble: 5 × 3</span></span></span>
<span><span class='c'>#&gt;       a b     c    </span></span>
<span><span class='c'>#&gt;   <span style='color: #555555; font-style: italic;'>&lt;int&gt;</span> <span style='color: #555555; font-style: italic;'>&lt;chr&gt;</span> <span style='color: #555555; font-style: italic;'>&lt;chr&gt;</span></span></span>
<span><span class='c'>#&gt; <span style='color: #555555;'>1</span>     1 a     f    </span></span>
<span><span class='c'>#&gt; <span style='color: #555555;'>2</span>     2 b     g    </span></span>
<span><span class='c'>#&gt; <span style='color: #555555;'>3</span>     3 c     h    </span></span>
<span><span class='c'>#&gt; <span style='color: #555555;'>4</span>     4 d     i    </span></span>
<span><span class='c'>#&gt; <span style='color: #555555;'>5</span>     5 e     j</span></span>
<span></span></code></pre>

</div>

</div>

With our custom recode function ready, the next thing we need is a vector of column names that we want to apply this function to. A straightforward way to do this is to get all unique column names from our data dictionary.

<div class="highlight">

<pre class='chroma'><code class='language-r' data-lang='r'><span><span class='c'># vector of columns to recode</span></span>
<span><span class='nv'>cols_vec</span> <span class='o'>&lt;-</span> <span class='nf'><a href='https://rdrr.io/r/base/unique.html'>unique</a></span><span class='o'>(</span><span class='nv'>dat_dict</span><span class='o'>$</span><span class='nv'>col_nm</span><span class='o'>)</span></span>
<span><span class='nv'>cols_vec</span></span>
<span><span class='c'>#&gt; [1] "b" "c"</span></span>
<span></span></code></pre>

</div>

#### Recoding

Now we are all set, and the only thing left to do is to call [`across()`](https://dplyr.tidyverse.org/reference/across.html) on all of the column names in our data dictionary `all_of(col_vec)` and let our custom recode function `recode_col()` do its job.

<div class="highlight">

<pre class='chroma'><code class='language-r' data-lang='r'><span><span class='c'># recoding defined columns</span></span>
<span><span class='nv'>dat</span> <span class='o'>|&gt;</span> </span>
<span>  <span class='nf'><a href='https://dplyr.tidyverse.org/reference/mutate.html'>mutate</a></span><span class='o'>(</span><span class='nf'><a href='https://dplyr.tidyverse.org/reference/across.html'>across</a></span><span class='o'>(</span><span class='nf'><a href='https://tidyselect.r-lib.org/reference/all_of.html'>all_of</a></span><span class='o'>(</span><span class='nv'>cols_vec</span><span class='o'>)</span>,</span>
<span>                <span class='nv'>recode_col</span><span class='o'>)</span></span>
<span>  <span class='o'>)</span></span>
<span><span class='c'>#&gt; <span style='color: #555555;'># A tibble: 5 × 3</span></span></span>
<span><span class='c'>#&gt;       a b     c    </span></span>
<span><span class='c'>#&gt;   <span style='color: #555555; font-style: italic;'>&lt;int&gt;</span> <span style='color: #555555; font-style: italic;'>&lt;chr&gt;</span> <span style='color: #555555; font-style: italic;'>&lt;chr&gt;</span></span></span>
<span><span class='c'>#&gt; <span style='color: #555555;'>1</span>     1 a     f    </span></span>
<span><span class='c'>#&gt; <span style='color: #555555;'>2</span>     2 b     g    </span></span>
<span><span class='c'>#&gt; <span style='color: #555555;'>3</span>     3 c     h    </span></span>
<span><span class='c'>#&gt; <span style='color: #555555;'>4</span>     4 d     i    </span></span>
<span><span class='c'>#&gt; <span style='color: #555555;'>5</span>     5 e     j</span></span>
<span></span></code></pre>

</div>

#### Renaming columns

Occasionally, data dictionaries offer not just corresponding values and labels, but also new, typically more descriptive, column names.

I've dedicated an entire <a href="../2022-rename-columns/" role="highlight" target="_blank">blog post</a> to the subject of renaming columns based on a lookup table. However, as the approach is slightly different when using a dictionary compared to a pure lookup table, and since this topic is quite relevant, let's take a brief look at it.

Suppose our data dictionary, `dat_dict2` includes the original abbreviated column names `short_nm` and corresponding descriptive column names `long_nm`:

<div class="highlight">

<pre class='chroma'><code class='language-r' data-lang='r'><span><span class='c'>#&gt; <span style='color: #555555;'># A tibble: 10 × 4</span></span></span>
<span><span class='c'>#&gt;    short_nm long_nm value label</span></span>
<span><span class='c'>#&gt;    <span style='color: #555555; font-style: italic;'>&lt;chr&gt;</span>    <span style='color: #555555; font-style: italic;'>&lt;chr&gt;</span>   <span style='color: #555555; font-style: italic;'>&lt;int&gt;</span> <span style='color: #555555; font-style: italic;'>&lt;chr&gt;</span></span></span>
<span><span class='c'>#&gt; <span style='color: #555555;'> 1</span> b        new_b      10 a    </span></span>
<span><span class='c'>#&gt; <span style='color: #555555;'> 2</span> b        new_b      11 b    </span></span>
<span><span class='c'>#&gt; <span style='color: #555555;'> 3</span> b        new_b      12 c    </span></span>
<span><span class='c'>#&gt; <span style='color: #555555;'> 4</span> b        new_b      13 d    </span></span>
<span><span class='c'>#&gt; <span style='color: #555555;'> 5</span> b        new_b      14 e    </span></span>
<span><span class='c'>#&gt; <span style='color: #555555;'> 6</span> c        new_c      20 f    </span></span>
<span><span class='c'>#&gt; <span style='color: #555555;'> 7</span> c        new_c      21 g    </span></span>
<span><span class='c'>#&gt; <span style='color: #555555;'> 8</span> c        new_c      22 h    </span></span>
<span><span class='c'>#&gt; <span style='color: #555555;'> 9</span> c        new_c      23 i    </span></span>
<span><span class='c'>#&gt; <span style='color: #555555;'>10</span> c        new_c      24 j</span></span>
<span></span></code></pre>

</div>

<div class="output-box" title="Expand to show code">

<div class="highlight">

<pre class='chroma'><code class='language-r' data-lang='r'><span><span class='c'># dictionary</span></span>
<span><span class='nv'>dat_dict2</span> <span class='o'>&lt;-</span> <span class='nf'><a href='https://tibble.tidyverse.org/reference/tibble.html'>tibble</a></span><span class='o'>(</span></span>
<span>  </span>
<span>  short_nm <span class='o'>=</span> <span class='nf'><a href='https://rdrr.io/r/base/c.html'>c</a></span><span class='o'>(</span></span>
<span>    <span class='nf'><a href='https://rdrr.io/r/base/rep.html'>rep</a></span><span class='o'>(</span><span class='s'>"b"</span>, <span class='m'>5</span><span class='o'>)</span>,</span>
<span>    <span class='nf'><a href='https://rdrr.io/r/base/rep.html'>rep</a></span><span class='o'>(</span><span class='s'>"c"</span>, <span class='m'>5</span><span class='o'>)</span></span>
<span>  <span class='o'>)</span>,</span>
<span>  </span>
<span>  long_nm <span class='o'>=</span> <span class='nf'><a href='https://rdrr.io/r/base/c.html'>c</a></span><span class='o'>(</span></span>
<span>    <span class='nf'><a href='https://rdrr.io/r/base/rep.html'>rep</a></span><span class='o'>(</span><span class='s'>"new_b"</span>, <span class='m'>5</span><span class='o'>)</span>,</span>
<span>    <span class='nf'><a href='https://rdrr.io/r/base/rep.html'>rep</a></span><span class='o'>(</span><span class='s'>"new_c"</span>, <span class='m'>5</span><span class='o'>)</span></span>
<span>  <span class='o'>)</span>,</span>
<span>  </span>
<span>  value <span class='o'>=</span> <span class='nf'><a href='https://rdrr.io/r/base/c.html'>c</a></span><span class='o'>(</span></span>
<span>    <span class='m'>10</span><span class='o'>:</span><span class='m'>14</span>,</span>
<span>    <span class='m'>20</span><span class='o'>:</span><span class='m'>24</span></span>
<span>  <span class='o'>)</span>,</span>
<span>  </span>
<span>  label <span class='o'>=</span> <span class='nf'><a href='https://rdrr.io/r/base/c.html'>c</a></span><span class='o'>(</span></span>
<span>    <span class='nv'>letters</span><span class='o'>[</span><span class='m'>1</span><span class='o'>:</span><span class='m'>5</span><span class='o'>]</span>,</span>
<span>    <span class='nv'>letters</span><span class='o'>[</span><span class='m'>6</span><span class='o'>:</span><span class='m'>10</span><span class='o'>]</span></span>
<span>  <span class='o'>)</span></span>
<span><span class='o'>)</span></span></code></pre>

</div>

</div>

This time, we only require a named vector of corresponding old and new column names. To create that we use our data dictionary and filter it for distinct entries in `short_nm` and `long_nm`. Then we use again [`pull()`](https://dplyr.tidyverse.org/reference/pull.html) together with its `name` argument, but note that the old and new values are in reverse positions compared to [`recode()`](https://dplyr.tidyverse.org/reference/recode.html).

<div class="highlight">

<pre class='chroma'><code class='language-r' data-lang='r'><span><span class='nv'>rename_vec</span> <span class='o'>&lt;-</span> <span class='nv'>dat_dict2</span> <span class='o'>|&gt;</span></span>
<span>  <span class='nf'><a href='https://dplyr.tidyverse.org/reference/distinct.html'>distinct</a></span><span class='o'>(</span><span class='nv'>short_nm</span>, <span class='nv'>long_nm</span><span class='o'>)</span> <span class='o'>|&gt;</span></span>
<span>  <span class='nf'><a href='https://dplyr.tidyverse.org/reference/pull.html'>pull</a></span><span class='o'>(</span><span class='nv'>short_nm</span>, name <span class='o'>=</span> <span class='nv'>long_nm</span><span class='o'>)</span></span>
<span></span>
<span><span class='nv'>rename_vec</span></span>
<span><span class='c'>#&gt; new_b new_c </span></span>
<span><span class='c'>#&gt;   "b"   "c"</span></span>
<span></span></code></pre>

</div>

Once we have this named vector of corresponding short and long column names we use [`all_of()`](https://tidyselect.r-lib.org/reference/all_of.html) inside [`rename()`](https://dplyr.tidyverse.org/reference/rename.html):

<div class="highlight">

<pre class='chroma'><code class='language-r' data-lang='r'><span><span class='nv'>dat</span> <span class='o'>|&gt;</span></span>
<span>  <span class='nf'><a href='https://dplyr.tidyverse.org/reference/rename.html'>rename</a></span><span class='o'>(</span><span class='nf'><a href='https://tidyselect.r-lib.org/reference/all_of.html'>all_of</a></span><span class='o'>(</span><span class='nv'>rename_vec</span><span class='o'>)</span><span class='o'>)</span></span>
<span><span class='c'>#&gt; <span style='color: #555555;'># A tibble: 5 × 3</span></span></span>
<span><span class='c'>#&gt;       a new_b new_c</span></span>
<span><span class='c'>#&gt;   <span style='color: #555555; font-style: italic;'>&lt;int&gt;</span> <span style='color: #555555; font-style: italic;'>&lt;int&gt;</span> <span style='color: #555555; font-style: italic;'>&lt;int&gt;</span></span></span>
<span><span class='c'>#&gt; <span style='color: #555555;'>1</span>     1    10    20</span></span>
<span><span class='c'>#&gt; <span style='color: #555555;'>2</span>     2    11    21</span></span>
<span><span class='c'>#&gt; <span style='color: #555555;'>3</span>     3    12    22</span></span>
<span><span class='c'>#&gt; <span style='color: #555555;'>4</span>     4    13    23</span></span>
<span><span class='c'>#&gt; <span style='color: #555555;'>5</span>     5    14    24</span></span>
<span></span></code></pre>

</div>

As we've demonstrated above, it's remarkably straightforward to not just recode, but also rename columns according to a data dictionary. If your work solely involves single datasets, you can skip the next section, which will expand upon the previous approach, demonstrating how to recode a list of datasets.

## Recoding many datasets

#### Setup and Reasoning

Initially, the necessity of having a list of datasets and one comprehensive data dictionary may not be evident. A plausible scenario, for instance, could be a customer survey program composed of numerous surveys featuring similar, yet not identical, survey items. These survey results are stored in a generic table within a database, with columns simply labeled `item1`, `item2`, etc. The number of survey items may vary among surveys. Each row contains a respondent ID to identify a respondent and a survey ID to indicate the specific customer journey under which a respondent was surveyed. As the surveys are similar but not identical, the same column (e.g., `item1`) may contain different values across different surveys. Even if column values are consistent, they could correspond to different labels.

Again, our objective is to recode---and while we're at it, also rename---all columns listed in the data dictionary across all surveys.

To keep this example as straightforward as possible, we'll use a minimal setup. In addition to `dat` from before, let's construct another small toy dataset `dat2` and nest both within a `data.frame` consisting of two columns: the `id` of each dataset and the actual `data`.

<div class="highlight">

<pre class='chroma'><code class='language-r' data-lang='r'><span><span class='c'># another dataset</span></span>
<span><span class='nv'>dat2</span> <span class='o'>&lt;-</span> <span class='nf'><a href='https://tibble.tidyverse.org/reference/tibble.html'>tibble</a></span><span class='o'>(</span>a <span class='o'>=</span> <span class='m'>1</span><span class='o'>:</span><span class='m'>5</span>,</span>
<span>               d <span class='o'>=</span> <span class='m'>10</span><span class='o'>:</span><span class='m'>14</span>,</span>
<span>               e <span class='o'>=</span> <span class='m'>7</span><span class='o'>:</span><span class='m'>11</span><span class='o'>)</span></span>
<span></span>
<span></span>
<span><span class='c'># a list of datasets</span></span>
<span><span class='nv'>dat_ls</span> <span class='o'>&lt;-</span> <span class='nf'><a href='https://tibble.tidyverse.org/reference/tibble.html'>tibble</a></span><span class='o'>(</span>id <span class='o'>=</span> <span class='nf'><a href='https://rdrr.io/r/base/c.html'>c</a></span><span class='o'>(</span><span class='s'>"dat1"</span>, <span class='s'>"dat2"</span><span class='o'>)</span>,</span>
<span>                 data <span class='o'>=</span> <span class='nf'>tibble</span><span class='nf'>::</span><span class='nf'><a href='https://tibble.tidyverse.org/reference/lst.html'>lst</a></span><span class='o'>(</span><span class='nv'>dat</span>, <span class='nv'>dat2</span><span class='o'>)</span><span class='o'>)</span></span>
<span></span>
<span><span class='nv'>dat_ls</span></span>
<span><span class='c'>#&gt; <span style='color: #555555;'># A tibble: 2 × 2</span></span></span>
<span><span class='c'>#&gt;   id    data            </span></span>
<span><span class='c'>#&gt;   <span style='color: #555555; font-style: italic;'>&lt;chr&gt;</span> <span style='color: #555555; font-style: italic;'>&lt;named list&gt;</span>    </span></span>
<span><span class='c'>#&gt; <span style='color: #555555;'>1</span> dat1  <span style='color: #555555;'>&lt;tibble [5 × 3]&gt;</span></span></span>
<span><span class='c'>#&gt; <span style='color: #555555;'>2</span> dat2  <span style='color: #555555;'>&lt;tibble [5 × 3]&gt;</span></span></span>
<span></span></code></pre>

</div>

This is how the "data" list-column looks like:

<div class="highlight">

<pre class='chroma'><code class='language-r' data-lang='r'><span><span class='nv'>dat_ls</span><span class='o'>$</span><span class='nv'>data</span></span>
<span><span class='c'>#&gt; $dat</span></span>
<span><span class='c'>#&gt; <span style='color: #555555;'># A tibble: 5 × 3</span></span></span>
<span><span class='c'>#&gt;       a     b     c</span></span>
<span><span class='c'>#&gt;   <span style='color: #555555; font-style: italic;'>&lt;int&gt;</span> <span style='color: #555555; font-style: italic;'>&lt;int&gt;</span> <span style='color: #555555; font-style: italic;'>&lt;int&gt;</span></span></span>
<span><span class='c'>#&gt; <span style='color: #555555;'>1</span>     1    10    20</span></span>
<span><span class='c'>#&gt; <span style='color: #555555;'>2</span>     2    11    21</span></span>
<span><span class='c'>#&gt; <span style='color: #555555;'>3</span>     3    12    22</span></span>
<span><span class='c'>#&gt; <span style='color: #555555;'>4</span>     4    13    23</span></span>
<span><span class='c'>#&gt; <span style='color: #555555;'>5</span>     5    14    24</span></span>
<span><span class='c'>#&gt; </span></span>
<span><span class='c'>#&gt; $dat2</span></span>
<span><span class='c'>#&gt; <span style='color: #555555;'># A tibble: 5 × 3</span></span></span>
<span><span class='c'>#&gt;       a     d     e</span></span>
<span><span class='c'>#&gt;   <span style='color: #555555; font-style: italic;'>&lt;int&gt;</span> <span style='color: #555555; font-style: italic;'>&lt;int&gt;</span> <span style='color: #555555; font-style: italic;'>&lt;int&gt;</span></span></span>
<span><span class='c'>#&gt; <span style='color: #555555;'>1</span>     1    10     7</span></span>
<span><span class='c'>#&gt; <span style='color: #555555;'>2</span>     2    11     8</span></span>
<span><span class='c'>#&gt; <span style='color: #555555;'>3</span>     3    12     9</span></span>
<span><span class='c'>#&gt; <span style='color: #555555;'>4</span>     4    13    10</span></span>
<span><span class='c'>#&gt; <span style='color: #555555;'>5</span>     5    14    11</span></span>
<span></span></code></pre>

</div>

We assume once more that we have a data dictionary, `dat_dict3`, which contains old, short column names `short_nm`, new long column names `long_nm`, as well as a mapping between `value`s and `label`s. The only difference from the previous example is that we now have an additional `id` column, indicating to which dataset the value-label mappings belong.

<div class="highlight">

<pre class='chroma'><code class='language-r' data-lang='r'><span><span class='c'>#&gt; <span style='color: #555555;'># A tibble: 20 × 5</span></span></span>
<span><span class='c'>#&gt;    id    short_nm long_nm value label</span></span>
<span><span class='c'>#&gt;    <span style='color: #555555; font-style: italic;'>&lt;chr&gt;</span> <span style='color: #555555; font-style: italic;'>&lt;chr&gt;</span>    <span style='color: #555555; font-style: italic;'>&lt;chr&gt;</span>   <span style='color: #555555; font-style: italic;'>&lt;int&gt;</span> <span style='color: #555555; font-style: italic;'>&lt;chr&gt;</span></span></span>
<span><span class='c'>#&gt; <span style='color: #555555;'> 1</span> dat1  b        new_b      10 a    </span></span>
<span><span class='c'>#&gt; <span style='color: #555555;'> 2</span> dat1  b        new_b      11 b    </span></span>
<span><span class='c'>#&gt; <span style='color: #555555;'> 3</span> dat1  b        new_b      12 c    </span></span>
<span><span class='c'>#&gt; <span style='color: #555555;'> 4</span> dat1  b        new_b      13 d    </span></span>
<span><span class='c'>#&gt; <span style='color: #555555;'> 5</span> dat1  b        new_b      14 e    </span></span>
<span><span class='c'>#&gt; <span style='color: #555555;'> 6</span> dat1  c        new_c      20 f    </span></span>
<span><span class='c'>#&gt; <span style='color: #555555;'> 7</span> dat1  c        new_c      21 g    </span></span>
<span><span class='c'>#&gt; <span style='color: #555555;'> 8</span> dat1  c        new_c      22 h    </span></span>
<span><span class='c'>#&gt; <span style='color: #555555;'> 9</span> dat1  c        new_c      23 i    </span></span>
<span><span class='c'>#&gt; <span style='color: #555555;'>10</span> dat1  c        new_c      24 j    </span></span>
<span><span class='c'>#&gt; <span style='color: #555555;'>11</span> dat2  d        new_d      10 f    </span></span>
<span><span class='c'>#&gt; <span style='color: #555555;'>12</span> dat2  d        new_d      11 g    </span></span>
<span><span class='c'>#&gt; <span style='color: #555555;'>13</span> dat2  d        new_d      12 h    </span></span>
<span><span class='c'>#&gt; <span style='color: #555555;'>14</span> dat2  d        new_d      13 i    </span></span>
<span><span class='c'>#&gt; <span style='color: #555555;'>15</span> dat2  d        new_d      14 j    </span></span>
<span><span class='c'>#&gt; <span style='color: #555555;'>16</span> dat2  e        new_e       7 17   </span></span>
<span><span class='c'>#&gt; <span style='color: #555555;'>17</span> dat2  e        new_e       8 18   </span></span>
<span><span class='c'>#&gt; <span style='color: #555555;'>18</span> dat2  e        new_e       9 19   </span></span>
<span><span class='c'>#&gt; <span style='color: #555555;'>19</span> dat2  e        new_e      10 20   </span></span>
<span><span class='c'>#&gt; <span style='color: #555555;'>20</span> dat2  e        new_e      11 21</span></span>
<span></span></code></pre>

</div>

<div class="output-box" title="Expand to show code">

<div class="highlight">

<pre class='chroma'><code class='language-r' data-lang='r'><span><span class='c'># a data dictionary containing codes for several datasets</span></span>
<span><span class='nv'>dat_dict3</span> <span class='o'>&lt;-</span> <span class='nf'><a href='https://tibble.tidyverse.org/reference/tibble.html'>tibble</a></span><span class='o'>(</span></span>
<span>  </span>
<span>  id <span class='o'>=</span> <span class='nf'><a href='https://rdrr.io/r/base/c.html'>c</a></span><span class='o'>(</span></span>
<span>    <span class='nf'><a href='https://rdrr.io/r/base/rep.html'>rep</a></span><span class='o'>(</span><span class='s'>"dat1"</span>, <span class='m'>10</span><span class='o'>)</span>,</span>
<span>    <span class='nf'><a href='https://rdrr.io/r/base/rep.html'>rep</a></span><span class='o'>(</span><span class='s'>"dat2"</span>, <span class='m'>10</span><span class='o'>)</span></span>
<span>  <span class='o'>)</span>,</span>
<span>  </span>
<span>  short_nm <span class='o'>=</span> <span class='nf'><a href='https://rdrr.io/r/base/c.html'>c</a></span><span class='o'>(</span></span>
<span>    <span class='nf'><a href='https://rdrr.io/r/base/rep.html'>rep</a></span><span class='o'>(</span><span class='s'>"b"</span>, <span class='m'>5</span><span class='o'>)</span>,</span>
<span>    <span class='nf'><a href='https://rdrr.io/r/base/rep.html'>rep</a></span><span class='o'>(</span><span class='s'>"c"</span>, <span class='m'>5</span><span class='o'>)</span>,</span>
<span>    <span class='nf'><a href='https://rdrr.io/r/base/rep.html'>rep</a></span><span class='o'>(</span><span class='s'>"d"</span>, <span class='m'>5</span><span class='o'>)</span>,</span>
<span>    <span class='nf'><a href='https://rdrr.io/r/base/rep.html'>rep</a></span><span class='o'>(</span><span class='s'>"e"</span>, <span class='m'>5</span><span class='o'>)</span></span>
<span>  <span class='o'>)</span>,</span>
<span>  </span>
<span>  long_nm <span class='o'>=</span> <span class='nf'><a href='https://rdrr.io/r/base/c.html'>c</a></span><span class='o'>(</span></span>
<span>    <span class='nf'><a href='https://rdrr.io/r/base/rep.html'>rep</a></span><span class='o'>(</span><span class='s'>"new_b"</span>, <span class='m'>5</span><span class='o'>)</span>,</span>
<span>    <span class='nf'><a href='https://rdrr.io/r/base/rep.html'>rep</a></span><span class='o'>(</span><span class='s'>"new_c"</span>, <span class='m'>5</span><span class='o'>)</span>,</span>
<span>    <span class='nf'><a href='https://rdrr.io/r/base/rep.html'>rep</a></span><span class='o'>(</span><span class='s'>"new_d"</span>, <span class='m'>5</span><span class='o'>)</span>,</span>
<span>    <span class='nf'><a href='https://rdrr.io/r/base/rep.html'>rep</a></span><span class='o'>(</span><span class='s'>"new_e"</span>, <span class='m'>5</span><span class='o'>)</span></span>
<span>  <span class='o'>)</span>,</span>
<span>  </span>
<span>  value <span class='o'>=</span> </span>
<span>    <span class='nf'><a href='https://rdrr.io/r/base/c.html'>c</a></span><span class='o'>(</span></span>
<span>    <span class='m'>10</span><span class='o'>:</span><span class='m'>14</span>,</span>
<span>    <span class='m'>20</span><span class='o'>:</span><span class='m'>24</span>,</span>
<span>    <span class='m'>10</span><span class='o'>:</span><span class='m'>14</span>,</span>
<span>    <span class='m'>7</span><span class='o'>:</span><span class='m'>11</span></span>
<span>  <span class='o'>)</span>,</span>
<span>  </span>
<span>  label <span class='o'>=</span> <span class='nf'><a href='https://rdrr.io/r/base/c.html'>c</a></span><span class='o'>(</span></span>
<span>    <span class='nv'>letters</span><span class='o'>[</span><span class='m'>1</span><span class='o'>:</span><span class='m'>5</span><span class='o'>]</span>,</span>
<span>    <span class='nv'>letters</span><span class='o'>[</span><span class='m'>6</span><span class='o'>:</span><span class='m'>10</span><span class='o'>]</span>,</span>
<span>    <span class='nv'>letters</span><span class='o'>[</span><span class='m'>6</span><span class='o'>:</span><span class='m'>10</span><span class='o'>]</span>,</span>
<span>    <span class='m'>17</span><span class='o'>:</span><span class='m'>21</span></span>
<span>  <span class='o'>)</span></span>
<span><span class='o'>)</span></span></code></pre>

</div>

</div>

#### Preparations

Before the actual recoding can take place, we have to prepare two functions:

1.  a custom function, `recode_col2()`, that recodes **one** column according to **a specified** dictionary and

2.  another custom function, `recode_df()`, which applies `recode_col2()` inside [`across()`](https://dplyr.tidyverse.org/reference/across.html) to all specified columns.

The first function is pretty similar to what we have seen earlier, with the only difference being the use of two arguments, the column to recode, `x` and the dictionary according to which the column should be recoded `dict`:

<div class="highlight">

<pre class='chroma'><code class='language-r' data-lang='r'><span><span class='c'># recode function</span></span>
<span><span class='nv'>recode_col2</span> <span class='o'>&lt;-</span> <span class='kr'>function</span><span class='o'>(</span><span class='nv'>x</span>, <span class='nv'>dict</span><span class='o'>)</span> <span class='o'>&#123;</span></span>
<span>  </span>
<span>  <span class='nv'>col_nm</span> <span class='o'>&lt;-</span> <span class='nf'><a href='https://dplyr.tidyverse.org/reference/context.html'>cur_column</a></span><span class='o'>(</span><span class='o'>)</span></span>
<span>  </span>
<span>  <span class='nv'>recode_vec</span> <span class='o'>&lt;-</span> <span class='nv'>dict</span> <span class='o'>|&gt;</span></span>
<span>    <span class='nf'><a href='https://dplyr.tidyverse.org/reference/filter.html'>filter</a></span><span class='o'>(</span><span class='nv'>short_nm</span> <span class='o'>==</span> <span class='nf'><a href='https://dplyr.tidyverse.org/reference/context.html'>cur_column</a></span><span class='o'>(</span><span class='o'>)</span><span class='o'>)</span> <span class='o'>|&gt;</span></span>
<span>    <span class='nf'><a href='https://dplyr.tidyverse.org/reference/pull.html'>pull</a></span><span class='o'>(</span><span class='nv'>label</span>, name <span class='o'>=</span> <span class='nv'>value</span><span class='o'>)</span></span>
<span>  </span>
<span>  <span class='nf'>dplyr</span><span class='nf'>::</span><span class='nf'><a href='https://dplyr.tidyverse.org/reference/recode.html'>recode</a></span><span class='o'>(</span><span class='nv'>x</span>, <span class='o'>!</span><span class='o'>!</span><span class='o'>!</span> <span class='nv'>recode_vec</span><span class='o'>)</span></span>
<span><span class='o'>&#125;</span></span></code></pre>

</div>

The second function, `recode_df`, basically wraps the actual recoding that we've used in the section above into a function. It takes two arguments: the dataset we want to recode, `dat`, and the `id` of the dataset as specified in the data dictionary (which should be the same as in our nested data.frame `dat_ls`).

<div class="highlight">

<pre class='chroma'><code class='language-r' data-lang='r'><span><span class='nv'>recode_df</span> <span class='o'>&lt;-</span> <span class='kr'>function</span><span class='o'>(</span><span class='nv'>dat</span>, <span class='nv'>dat_id</span><span class='o'>)</span> <span class='o'>&#123;</span></span>
<span>  </span>
<span>  <span class='c'># 1. get the current entries </span></span>
<span>  <span class='nv'>cur_dat_dict</span> <span class='o'>&lt;-</span> <span class='nv'>dat_dict3</span> <span class='o'>|&gt;</span></span>
<span>    <span class='nf'><a href='https://dplyr.tidyverse.org/reference/filter.html'>filter</a></span><span class='o'>(</span><span class='nv'>id</span> <span class='o'>==</span> <span class='nv'>dat_id</span><span class='o'>)</span> </span>
<span>  </span>
<span>  <span class='c'># 2. vector of columns to recode</span></span>
<span>  <span class='nv'>cols_vec</span> <span class='o'>&lt;-</span> <span class='nf'><a href='https://rdrr.io/r/base/unique.html'>unique</a></span><span class='o'>(</span><span class='nv'>cur_dat_dict</span><span class='o'>[[</span><span class='s'>"short_nm"</span><span class='o'>]</span><span class='o'>]</span><span class='o'>)</span></span>
<span>  </span>
<span>  <span class='c'># 3. use across with both inputs and recode_col2</span></span>
<span>  <span class='nv'>dat</span> <span class='o'>|&gt;</span> </span>
<span>    <span class='nf'><a href='https://dplyr.tidyverse.org/reference/mutate.html'>mutate</a></span><span class='o'>(</span><span class='nf'><a href='https://dplyr.tidyverse.org/reference/across.html'>across</a></span><span class='o'>(</span><span class='nf'><a href='https://tidyselect.r-lib.org/reference/all_of.html'>all_of</a></span><span class='o'>(</span><span class='nv'>cols_vec</span><span class='o'>)</span>,</span>
<span>                  \<span class='o'>(</span><span class='nv'>x</span><span class='o'>)</span> <span class='nf'>recode_col2</span><span class='o'>(</span><span class='nv'>x</span>, <span class='nv'>cur_dat_dict</span><span class='o'>)</span><span class='o'>)</span></span>
<span>    <span class='o'>)</span></span>
<span><span class='o'>&#125;</span></span></code></pre>

</div>

This function will be applied iteratively to each individual dataset in our list of data.frames `dat_ls`. The function consists of three steps:

1.  We subset our data dictionary with the supplied data ID to ensure only the value-label mappings of the current dataset remain. We call this subset of our dictionary `cur_dat_dict`.

2.  We then create a vector of column names, `cols_vec`, that we want to recode. These will consist of all unique column names in the current dictionary `cur_dat_dict`.

3.  Finally, we use [`dplyr::across()`](https://dplyr.tidyverse.org/reference/across.html) on `all_of` the columns in `cols_vec` and supply the current column `x` and the current dictionary `cur_dat_dict` to `recode_col2()`.

#### Recoding

The last step is to iteratively apply our new function `recode_df()` to our nested data.frame `dat_ls`. This requires us first to call [`rowwise()`](https://dplyr.tidyverse.org/reference/rowwise.html) on `dat_ls`, which applies all subsequent dplyr functions row-by-row. We then overwrite our column holding the `data` with `list(recode_df(data, id))`. It's important to note that our custom function must be wrapped in [`list()`](https://rdrr.io/r/base/list.html), as it returns a non-atomic vector (a list of `data.frames`).

<div class="highlight">

<pre class='chroma'><code class='language-r' data-lang='r'><span><span class='nv'>dat_ls</span> <span class='o'>|&gt;</span> </span>
<span>  <span class='nf'><a href='https://dplyr.tidyverse.org/reference/rowwise.html'>rowwise</a></span><span class='o'>(</span><span class='o'>)</span> <span class='o'>|&gt;</span> </span>
<span>  <span class='nf'><a href='https://dplyr.tidyverse.org/reference/mutate.html'>mutate</a></span><span class='o'>(</span>data <span class='o'>=</span> <span class='nf'><a href='https://rdrr.io/r/base/list.html'>list</a></span><span class='o'>(</span><span class='nf'>recode_df</span><span class='o'>(</span><span class='nv'>data</span>, <span class='nv'>id</span><span class='o'>)</span><span class='o'>)</span><span class='o'>)</span> <span class='o'>|&gt;</span></span>
<span>  <span class='nf'><a href='https://dplyr.tidyverse.org/reference/pull.html'>pull</a></span><span class='o'>(</span><span class='nv'>data</span><span class='o'>)</span> <span class='c'># &lt;= for better printing</span></span>
<span><span class='c'>#&gt; [[1]]</span></span>
<span><span class='c'>#&gt; <span style='color: #555555;'># A tibble: 5 × 3</span></span></span>
<span><span class='c'>#&gt;       a b     c    </span></span>
<span><span class='c'>#&gt;   <span style='color: #555555; font-style: italic;'>&lt;int&gt;</span> <span style='color: #555555; font-style: italic;'>&lt;chr&gt;</span> <span style='color: #555555; font-style: italic;'>&lt;chr&gt;</span></span></span>
<span><span class='c'>#&gt; <span style='color: #555555;'>1</span>     1 a     f    </span></span>
<span><span class='c'>#&gt; <span style='color: #555555;'>2</span>     2 b     g    </span></span>
<span><span class='c'>#&gt; <span style='color: #555555;'>3</span>     3 c     h    </span></span>
<span><span class='c'>#&gt; <span style='color: #555555;'>4</span>     4 d     i    </span></span>
<span><span class='c'>#&gt; <span style='color: #555555;'>5</span>     5 e     j    </span></span>
<span><span class='c'>#&gt; </span></span>
<span><span class='c'>#&gt; [[2]]</span></span>
<span><span class='c'>#&gt; <span style='color: #555555;'># A tibble: 5 × 3</span></span></span>
<span><span class='c'>#&gt;       a d     e    </span></span>
<span><span class='c'>#&gt;   <span style='color: #555555; font-style: italic;'>&lt;int&gt;</span> <span style='color: #555555; font-style: italic;'>&lt;chr&gt;</span> <span style='color: #555555; font-style: italic;'>&lt;chr&gt;</span></span></span>
<span><span class='c'>#&gt; <span style='color: #555555;'>1</span>     1 f     17   </span></span>
<span><span class='c'>#&gt; <span style='color: #555555;'>2</span>     2 g     18   </span></span>
<span><span class='c'>#&gt; <span style='color: #555555;'>3</span>     3 h     19   </span></span>
<span><span class='c'>#&gt; <span style='color: #555555;'>4</span>     4 i     20   </span></span>
<span><span class='c'>#&gt; <span style='color: #555555;'>5</span>     5 j     21</span></span>
<span></span></code></pre>

</div>

#### Rename many datasets based on a data dicitonary

Analogous to `recode_df()`, we can create a function that renames all columns of a dataset, below called `rename_df()`. The function works in two steps. Initially, we create vector of old and new name pairs based on the distinct entries of our data dictionary that are relevant for this dataset `filter(id == dat_id)`. Next, we use this named vector within `rename(all_of()`:

<div class="highlight">

<pre class='chroma'><code class='language-r' data-lang='r'><span><span class='nv'>rename_df</span> <span class='o'>&lt;-</span> <span class='kr'>function</span><span class='o'>(</span><span class='nv'>data</span>, <span class='nv'>dat_id</span><span class='o'>)</span> <span class='o'>&#123;</span></span>
<span>  </span>
<span>  <span class='c'># 1. create a vector of old and new name pairs ...</span></span>
<span>  <span class='c'># ... based on the current dictionary</span></span>
<span>  <span class='nv'>rename_vec</span> <span class='o'>&lt;-</span> <span class='nv'>dat_dict3</span> <span class='o'>|&gt;</span></span>
<span>    <span class='nf'><a href='https://dplyr.tidyverse.org/reference/filter.html'>filter</a></span><span class='o'>(</span><span class='nv'>id</span> <span class='o'>==</span> <span class='nv'>dat_id</span> <span class='o'>)</span> <span class='o'>|&gt;</span></span>
<span>    <span class='nf'><a href='https://dplyr.tidyverse.org/reference/distinct.html'>distinct</a></span><span class='o'>(</span><span class='nv'>short_nm</span>, <span class='nv'>long_nm</span><span class='o'>)</span> <span class='o'>|&gt;</span></span>
<span>    <span class='nf'><a href='https://dplyr.tidyverse.org/reference/pull.html'>pull</a></span><span class='o'>(</span><span class='nv'>short_nm</span>, name <span class='o'>=</span> <span class='nv'>long_nm</span><span class='o'>)</span></span>
<span></span>
<span>  <span class='c'># 2. use this vector on the supplied data</span></span>
<span>  <span class='nv'>data</span> <span class='o'>|&gt;</span></span>
<span>    <span class='nf'><a href='https://dplyr.tidyverse.org/reference/rename.html'>rename</a></span><span class='o'>(</span><span class='nf'><a href='https://tidyselect.r-lib.org/reference/all_of.html'>all_of</a></span><span class='o'>(</span><span class='nv'>rename_vec</span><span class='o'>)</span><span class='o'>)</span></span>
<span><span class='o'>&#125;</span></span></code></pre>

</div>

Applying this function to our nested `data.frame` of datasets is basically the same approach as outlined above:

<div class="highlight">

<pre class='chroma'><code class='language-r' data-lang='r'><span><span class='nv'>dat_ls</span> <span class='o'>|&gt;</span> </span>
<span>  <span class='nf'><a href='https://dplyr.tidyverse.org/reference/rowwise.html'>rowwise</a></span><span class='o'>(</span><span class='o'>)</span> <span class='o'>|&gt;</span> </span>
<span>  <span class='nf'><a href='https://dplyr.tidyverse.org/reference/mutate.html'>mutate</a></span><span class='o'>(</span>data <span class='o'>=</span> <span class='nf'><a href='https://rdrr.io/r/base/list.html'>list</a></span><span class='o'>(</span><span class='nf'>rename_df</span><span class='o'>(</span><span class='nv'>data</span>, <span class='nv'>id</span><span class='o'>)</span><span class='o'>)</span><span class='o'>)</span> <span class='o'>|&gt;</span></span>
<span>  <span class='nf'><a href='https://dplyr.tidyverse.org/reference/pull.html'>pull</a></span><span class='o'>(</span><span class='nv'>data</span><span class='o'>)</span> <span class='c'># &lt;= for betters printing</span></span>
<span><span class='c'>#&gt; [[1]]</span></span>
<span><span class='c'>#&gt; <span style='color: #555555;'># A tibble: 5 × 3</span></span></span>
<span><span class='c'>#&gt;       a new_b new_c</span></span>
<span><span class='c'>#&gt;   <span style='color: #555555; font-style: italic;'>&lt;int&gt;</span> <span style='color: #555555; font-style: italic;'>&lt;int&gt;</span> <span style='color: #555555; font-style: italic;'>&lt;int&gt;</span></span></span>
<span><span class='c'>#&gt; <span style='color: #555555;'>1</span>     1    10    20</span></span>
<span><span class='c'>#&gt; <span style='color: #555555;'>2</span>     2    11    21</span></span>
<span><span class='c'>#&gt; <span style='color: #555555;'>3</span>     3    12    22</span></span>
<span><span class='c'>#&gt; <span style='color: #555555;'>4</span>     4    13    23</span></span>
<span><span class='c'>#&gt; <span style='color: #555555;'>5</span>     5    14    24</span></span>
<span><span class='c'>#&gt; </span></span>
<span><span class='c'>#&gt; [[2]]</span></span>
<span><span class='c'>#&gt; <span style='color: #555555;'># A tibble: 5 × 3</span></span></span>
<span><span class='c'>#&gt;       a new_d new_e</span></span>
<span><span class='c'>#&gt;   <span style='color: #555555; font-style: italic;'>&lt;int&gt;</span> <span style='color: #555555; font-style: italic;'>&lt;int&gt;</span> <span style='color: #555555; font-style: italic;'>&lt;int&gt;</span></span></span>
<span><span class='c'>#&gt; <span style='color: #555555;'>1</span>     1    10     7</span></span>
<span><span class='c'>#&gt; <span style='color: #555555;'>2</span>     2    11     8</span></span>
<span><span class='c'>#&gt; <span style='color: #555555;'>3</span>     3    12     9</span></span>
<span><span class='c'>#&gt; <span style='color: #555555;'>4</span>     4    13    10</span></span>
<span><span class='c'>#&gt; <span style='color: #555555;'>5</span>     5    14    11</span></span>
<span></span></code></pre>

</div>

## Final Thoughts

Readers who follow me on Twitter might know that, although being a dplyr fan-boy, my feelings towards [`dplyr::recode()`](https://dplyr.tidyverse.org/reference/recode.html) were less enthusiastic. My main issue was the unconventional order of arguments, which diverges from what we know from [`rename()`](https://dplyr.tidyverse.org/reference/rename.html) or [`mutate()`](https://dplyr.tidyverse.org/reference/mutate.html).

<e-frame src="https://twitter.com/timteafan/status/1254898416402018310?s=61&amp;t=i8eoMCFkLgkJKWoZHxVvOQ"></e-frame>

The order of arguments was in part a reason why [`recode()`](https://dplyr.tidyverse.org/reference/recode.html) was flagged as "questioning" in dplyr version 1.0. Since dplyr version 1.1.0 [`recode()`](https://dplyr.tidyverse.org/reference/recode.html) moved one stage further in its life cycle and is now "superseded" by [`dplyr::case_match()`](https://dplyr.tidyverse.org/reference/case_match.html).

I'm not sure of the full implications of this development. If I understand the <a href="https://lifecycle.r-lib.org/articles/stages.html" role="highlight" target="_blank">life cycle stages</a> correctly, then "superseded" means that [`dplyr::recode()`](https://dplyr.tidyverse.org/reference/recode.html) is not going away any time soon and will continue to be maintained, though it will not see new features.

However, if there's a chance that [`dplyr::recode()`](https://dplyr.tidyverse.org/reference/recode.html) might become deprecated in future major releases, we would need to think about a workaround, since [`case_match()`](https://dplyr.tidyverse.org/reference/case_match.html) doesn't support the splicing of named vectors as arguments that we have used above. In that case, I will certainly update this blog post.

Despite my initial skepticism towards [`dplyr::recode()`](https://dplyr.tidyverse.org/reference/recode.html), I have to concede that, particularly in combination with [`across()`](https://dplyr.tidyverse.org/reference/across.html), it provides a clear and straight-forward workflow. With its ability to be used programmatically and to handel complex cases, I hope that this blog post has convincingly shown the benefits of this approach.

My original dplyr workflow was much more convoluted. The curious reader can find it in the answers to my <a href="https://stackoverflow.com/questions/56636417/bunch-recoding-of-variables-in-the-tidyverse-functional-meta-programing" role="highlight" target="_blank">question on StackOverflow</a> from a couple of years ago.

But even outside of dplyr I haven't encountered a similarly seamless approach to recoding multiple columns across several datasets. If you are up for a challenge, I'd love to see what base R or data.table solutions you can come with to tackle this problem. Let me know in the comments or via Twitter or Mastodon if you have an alternative approach.

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
<span><span class='c'>#&gt;  date     2023-06-30</span></span>
<span><span class='c'>#&gt;  pandoc   2.19.2 @ /Applications/RStudio.app/Contents/MacOS/quarto/bin/tools/ (via rmarkdown)</span></span>
<span><span class='c'>#&gt; </span></span>
<span><span class='c'>#&gt; <span style='color: #00BBBB; font-weight: bold;'>─ Packages ───────────────────────────────────────────────────────────────────</span></span></span>
<span><span class='c'>#&gt;  <span style='color: #555555; font-style: italic;'>package</span> <span style='color: #555555; font-style: italic;'>*</span> <span style='color: #555555; font-style: italic;'>version</span> <span style='color: #555555; font-style: italic;'>date (UTC)</span> <span style='color: #555555; font-style: italic;'>lib</span> <span style='color: #555555; font-style: italic;'>source</span></span></span>
<span><span class='c'>#&gt;  dplyr   * 1.1.0   <span style='color: #555555;'>2023-01-29</span> <span style='color: #555555;'>[1]</span> <span style='color: #555555;'>CRAN (R 4.2.0)</span></span></span>
<span><span class='c'>#&gt; </span></span>
<span><span class='c'>#&gt; <span style='color: #555555;'> [1] /Library/Frameworks/R.framework/Versions/4.2/Resources/library</span></span></span>
<span><span class='c'>#&gt; </span></span>
<span><span class='c'>#&gt; <span style='color: #00BBBB; font-weight: bold;'>──────────────────────────────────────────────────────────────────────────────</span></span></span>
<span></span></code></pre>

</div>

</details>

</div>

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

