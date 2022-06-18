// Get id paramter from URL.
const url = new URL(window.location.href);
const id = url.searchParams.get('id');

a = document.createElement('script');
a.src = `./articles/${id}.js`
document.getElementById('scriptContainer').appendChild(a);

function runStart() {
  editor = new EditorJS({
    readOnly: true,
    data: data,
    tools: {
      Marker: Marker,
      Header: Header,
      Table: Table,
      List: List,
      image: {
        class: SimpleImage,
        inlineToolbar: true
      },
      code: CodeTool,
      button: AnyButton,
      underline: Underline, 
      embed: {
        class: Embed,
        inlineToolbar: true
      },
      warning: Warning,
      checklist: Checklist

    }
  });

  document.getElementById('articleTitle').innerHTML = data.title;
}