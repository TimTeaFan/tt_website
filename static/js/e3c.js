// Define the custom element
class EFrame extends HTMLElement {

  // define CSS style and logic
  static cssAdded = false;

    constructor(config = readMetaConfig()) {
      super();
  
      this.config = config;

      // Get the source type (Twitter or YouTube)
      const src = this.getAttribute('src');
      this.sourceType = this.getAttribute('type')

      // if type is not specified try automatical detection
      if (!this.sourceType) {
        this.sourceType = checkUrlType(src)
      }

      this.sourceType = this.sourceType.toLowerCase()
      switch(this.sourceType) {
        case "twitter":
          this.sourceTypeLabel = "Twitter";
          break;
        case "youtube":
          this.sourceTypeLabel = "YouTube";
          break;
        case "vimeo":
          this.sourceTypeLabel = "Vimeo";
          break;
        case "mastodon":
          this.sourceTypeLabel = "Mastodon";
      }

      // Set the default max-width based on the source type
      var defaultMaxWidth = "550px"
      if (this.sourceType === 'youtube' || this.sourceType === 'vimeo') {
        defaultMaxWidth = "550px"
      }

      // Check if user has supplied a max-width attribute, otherwise use default
      const userMaxWidth = this.getAttribute('max-width');
      const maxWidth = userMaxWidth ? userMaxWidth : defaultMaxWidth;
      this.style.maxWidth = maxWidth;

      // Create the switch element
      this.switch = document.createElement('label');
      this.switch.setAttribute('class', 'e3c-switch');
      this.input = document.createElement('input');
      this.input.setAttribute('type', 'checkbox');
      this.slider = document.createElement('span');
      this.slider.setAttribute('class', 'e3c-slider round');
      this.switch.appendChild(this.input);
      this.switch.appendChild(this.slider);

      // Create the switch wrapper element
      this.switchWrapper = document.createElement('div');
      this.switchWrapper.setAttribute('class', 'e3c-switch-container');
      this.switchWrapper.style.display = 'flex';
      this.switchWrapper.style.alignItems = 'center';
      this.switchLabel = document.createTextNode(config.label + this.sourceTypeLabel);
            
      // Create the message elements
      this.heading = document.createElement('h4');
      this.heading.innerText = config.heading;
      this.message1 = document.createElement('p');
      this.message1.innerText = config.intro.replace('{sourceTypeLabel}', this.sourceTypeLabel);
      this.message2 = document.createElement('p');
      this.message2.setAttribute('class', 'e3c-fineprint');
      this.message2.innerText = config.consent;
 
      // Conditionally add link to privacy policy
      if (config.policy) {
        console.log("we are here")
        this.privacyPolicyLink = document.createElement('a');
        this.privacyPolicyLink.href = config.policy;
        this.privacyPolicyLink.innerText = 'privacy policy';
        const learnMoreText = document.createTextNode(' To learn more, please refer to our ');
        this.message2.appendChild(learnMoreText);
        this.message2.appendChild(this.privacyPolicyLink);
        this.message2.appendChild(document.createTextNode("."));
      }
 
      // Conditionally display the Twitter icon based on the show attribute

      if (config.show === 'icon') {
        
        const iconClass = `fab fa-${this.sourceType}`;
        this.icon = document.createElement('i');
        this.icon.setAttribute('class', iconClass);
        this.icon.style.marginRight = '10px';
        this.heading.prepend(this.icon);
      }

      // Create the tweet container element
      this.container = document.createElement('div');
      this.container.style.display = 'none';

      // Create the eframe container element
      this.eframeContainer = document.createElement('div');
      this.eframeContainer.setAttribute('class', 'eframe-container');

      // Add the elements to the eframe container element
      this.eframeContainer.appendChild(this.heading);
      this.eframeContainer.appendChild(this.message1);
      this.switchWrapper.appendChild(this.switch);
      this.switchWrapper.appendChild(this.switchLabel);
      this.eframeContainer.appendChild(this.switchWrapper);
      this.eframeContainer.appendChild(this.message2);
      this.eframeContainer.appendChild(this.container);

      // Add the eframe container element to the custom element
      this.appendChild(this.eframeContainer);

      // Add event listener to the switch
      this.input.addEventListener('change', this.onToggle.bind(this));
  
      // If CSS is not already added, append it to the document's head
      if (!EFrame.cssAdded) {
        EFrame.addCSS(config.show);
        EFrame.cssAdded = true;
      }

    }

    static addCSS(showAttribute) {

      // Check if the font-awesome should be added
      var add_fontawesome = "";
      if (showAttribute === 'icon') {
        add_fontawesome = "@import url('https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.1.0/css/all.min.css');"
      }

      // Create the CSS styles
      var css = `
  
      ${add_fontawesome}
  
      e-frame {
        display: block;
        width: 100%;
        height: 100%;
     }
   
      .e3c-switch {
        position: relative;
        margin-right: 5px;
        display: inline-block;
        width: 40px;
        height: 24px;
      }
  
      .e3c-switch-container {
        margin-bottom: 10px;
      }
      .e3c-switch input {
        display: none;
      }
  
      .e3c-slider {
        position: absolute;
        cursor: pointer;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background-color: #ccc;
        -webkit-transition: .4s;
        transition: .4s;
        border-radius: 34px;
      }
  
      .e3c-slider:before {
        position: absolute;
        content: "";
        height: 18px;
        width: 18px;
        left: 3px;
        bottom: 3px;
        background-color: white;
        -webkit-transition: .4s;
        transition: .4s;
        border-radius: 50%;
      }
  
      input:checked + .e3c-slider {
        background-color: #2196F3;
      }
  
      input:focus + .e3c-slider {
        box-shadow: 0 0 1px #2196F3;
      }
  
      input:checked + .e3c-slider:before {
        -webkit-transform: translateX(16px);
        -ms-transform: translateX(16px);
        transform: translateX(16px);
      }
    `;
  
      // Create the style element and append it to the document's head
      var style = document.createElement('style');
      style.innerHTML = css;
      document.head.appendChild(style);
  }
  
    loadTwitterWidget() {
      if (!window.twttr) {
        window.twttr = (function(d, s, id) {
          var js, fjs = d.getElementsByTagName(s)[0],
            t = window.twttr || {};
          if (d.getElementById(id)) return t;
          js = d.createElement(s);
          js.id = id;
          js.src = "https://platform.twitter.com/widgets.js";
          js.setAttribute('async', 'async');
        fjs.parentNode.insertBefore(js, fjs);
            t._e = [];
            t.ready = function(f) {
              t._e.push(f);
            };
            return t;
          }(document, "script", "twitter-wjs"));
        }
      }
   
      loadTweetContent(instance) {
        instance.loadTwitterWidget();
  
        // Load the tweet content
        var tweetEmbed = document.createElement('blockquote');
        tweetEmbed.setAttribute('class', 'twitter-tweet');
        tweetEmbed.innerHTML = '<a href="' + instance.getAttribute('src') + '"></a>';
  
        instance.container.appendChild(tweetEmbed);
  
        window.twttr.ready((twttr) => {
          twttr.widgets.load(instance.container);
        });
    }

    // Create YouTube iframe
    async loadYoutubeVideo(instance) {
      // Get Youtube ID
      // adpated from this SO answer: https://stackoverflow.com/a/51870158/9349302
      const regpat = /(https?:\/\/)?(((m|www)\.)?(youtube(-nocookie)?|youtube.googleapis)\.com.*(v\/|v=|vi=|vi\/|e\/|embed\/|user\/.*\/u\/\d+\/)|youtu\.be\/)([_0-9a-z-]+)/i;
      const youtubeId = instance.getAttribute('src').match(regpat)[8];

      // get dimenson of video and assign width and height
      const vid_dim = await fetchVideoDimensions(youtubeId);
      var vid_width  = instance.getAttribute('yt-width')  ? instance.getAttribute('yt-width')  : '640px';
      var vid_height = instance.getAttribute('yt-height') ? instance.getAttribute('yt-height') : '390px';

      if (!instance.getAttribute('yt-height') && instance.getAttribute('yt-width')) {
        const num_height = parseInt(vid_width, 10) / vid_dim
        vid_height = num_height.toString() + "px";
      };

      if (instance.getAttribute('yt-height') && !instance.getAttribute('yt-width')) {

        const num_width = parseInt(vid_height, 10) * vid_dim
        vid_width = num_width.toString() + "px";
      };
           
      // Load the YouTube iframe
      const iframe = document.createElement('iframe');
      iframe.width = vid_width;
      iframe.height =  vid_height;
      iframe.src = `https://www.youtube.com/embed/${youtubeId}`;
      iframe.title = "YouTube video player";
      iframe.style.border = "0px";
      iframe.allow = "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share";
      iframe.allowFullscreen = true;
      
      instance.container.appendChild(iframe);
  }

  loadVimeoVideo(instance) {
    
    // Get Vimeo ID
    const regex = /\d+$/;
    const vimeoId = instance.getAttribute('src').match(regex);

    // Load the YouTube iframe
    const outer_div = document.createElement('div');
    outer_div.style = "padding:56.25% 0 0 0;position:relative;"

    const iframe = document.createElement('iframe');
    iframe.src = `https://player.vimeo.com/video/${vimeoId}?h=ca92ea39ae&color=ff9933&portrait=0`;
    iframe.title = "Vimeo video player";
    iframe.style = "position:absolute;top:0;left:0;width:100%;height:100%;border:0px";
    iframe.allow = "autoplay; fullscreen; picture-in-picture";
    iframe.allowFullscreen = true;
    
    outer_div.appendChild(iframe);

    const script = document.createElement('script');

    // set the src attribute of the script
    script.setAttribute('src', 'https://player.vimeo.com/api/player.js');

    // append the script element to the div element
    outer_div.appendChild(script);

    instance.container.appendChild(outer_div);
}

  loadTootContent(instance) {
    var tootLink = instance.getAttribute('src');
    tootLink = tootLink.endsWith('/') ? tootLink.slice(0, -1) : tootLink;

    // Get Mastodon ID
    const regex = /\d+$/;
    const tootId = instance.getAttribute('src').match(regex);
    
    // Create the Mastodon iframe   
    const iframe = document.createElement('iframe');
    iframe.src =  `${tootLink}/embed`;
    iframe.setAttribute('class', "mastodon-embed");
    iframe.style = "max-width: 100%; border: 0";
    iframe.width = "550"; // "400"
    iframe.setAttribute('allowFullscreen', "allowfullscreen");
      
    // create fosstodon script
    const script = document.createElement('script');
    script.setAttribute('src', 'https://fosstodon.org/embed.js');
    script.setAttribute('async', 'async');

    // append iframe and script element to container
    instance.container.appendChild(iframe);
    instance.container.appendChild(script);

    
  }
  
      // Function to hide text and display container
      hideText(instance) {
        instance.container.style.display = "block";
        instance.heading.style.display = "none";
        instance.message1.style.display = "none";
        instance.message2.style.display = "none";
        instance.switchWrapper.setAttribute("old-label", instance.config.label + this.sourceTypeLabel);
        instance.switchLabel.textContent = "External content";
      }
  
      // Function to show text 
      showText(instance) {
        // Clear the content
        instance.container.innerHTML = '';
        instance.container.style.display = "none";
         
        // Show the messages
        instance.heading.style.display = "block";
        instance.message1.style.display = "block";
        instance.message2.style.display = "block";
        this.switchLabel.textContent = instance.switchWrapper.getAttribute("old-label") 
      }
    
      async onToggle() {

        if (this.input.checked) {

          if (this.sourceType === 'twitter') {
            this.loadTwitterWidget();
            this.loadTweetContent(this);
            this.hideText(this);
          } else if (this.sourceType === 'youtube') {
            this.loadYoutubeVideo(this);
            this.hideText(this);
          }  else if (this.sourceType === 'vimeo') {
            this.loadVimeoVideo(this);
            this.hideText(this);
          } else if (this.sourceType === 'mastodon') {
            console.log("we are here")
            // this.loadFosstodonEmbed();
            this.loadTootContent(this);
            this.hideText(this);
          }
        } else {
          this.showText(this);
        }
      }

    }

    //
    async function fetchVideoDimensions(videoUrlId) {
      const oembedUrl = `https://www.youtube.com/oembed?url=http%3A//www.youtube.com/watch%3Fv%3D${videoUrlId}&format=json`;
      
      try {
        const response = await fetch(oembedUrl);
        const data = await response.json();
        const { width, height } = data;
        const out = width / height;
        return out;
      } catch (error) {
        console.error("Error fetching video dimensions:", error);
        return null;
      }
    }

    // Function to readin the MetaConfig data
    function readMetaConfig() {
      const showMetaTag = document.querySelector('meta[name="eframe-show"]');
      const policyMetaTag = document.querySelector('meta[name="eframe-policy"]');
      const headingMetaTag = document.querySelector('meta[name="eframe-heading"]');
      const introMetaTag = document.querySelector('meta[name="eframe-intro"]');
      const labelMetaTag = document.querySelector('meta[name="eframe-label"]');
      const consentMetaTag = document.querySelector('meta[name="eframe-consent"]');

      return {
        show: showMetaTag ? showMetaTag.content : null,
        policy: policyMetaTag ? policyMetaTag.content : null,
        heading: headingMetaTag ? headingMetaTag.content : 'External Content',
        intro: introMetaTag ? introMetaTag.content : "Here you'll find additional content from {sourceTypeLabel} that complements the article. You can easily view it with a single click and then hide it again.",
        label: labelMetaTag ? labelMetaTag.content : "Show external content from ",
        consent: consentMetaTag ? consentMetaTag.content : 'I agree to have external content displayed to me. This may result in personal data being shared with third-party platforms.'
      };
    }

    // function to check if an URL links to youtube
    function isYouTubeLink(url) {
      const pattern = /^(?:https?:\/\/)?(?:www\.)?(?:m\.)?(?:youtu\.be\/|youtube(?:-nocookie)?\.com)/;
      return pattern.test(url);
    }
    
    // function to check if an URL links to Twitter
    function isTwitterLink(url) {
      const pattern = /^(?:https?:\/\/)?(?:www\.)?twitter\.com/;
      return pattern.test(url);
    }

    function isVimeoLink(url) {
      const pattern = /^https?:\/\/[^\/]*vimeo[^\/]*/;
      return pattern.test(url);
    }

    function checkUrlType(url) {
      if(isTwitterLink(url)) {
        return 'twitter'
      } else if (isYouTubeLink(url)) {
        return 'youtube'
      } else if (isVimeoLink(url)) {
        return 'vimeo'
      } else {
        return 'mastodon'
      }
    }
    
    // Define the custom element tag
    customElements.define('e-frame', EFrame);