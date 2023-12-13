export default {
  list: [
    {
      name: 'Button',
      name_ch: '按钮',
      dependenceVersion: '*',
      dependence: {
        package: 'vant',
        export_name: 'Button',
        sub_name: null,
        destructuring: 1,
      },
      props: {
        type: 'primary',
      },
      methods: { click: "() => { console.log('method') }" },
    },
    // {
    //   name: 'Cell',
    //   name_ch: '单元格',
    //   dependenceVersion: '*',
    //   dependence: {
    //     package: 'vant',
    //     export_name: 'Cell',
    //     sub_name: null,
    //     destructuring: 1
    //   },
    //   props: {
    //     description: 'props: title,value',
    //     title: '单元格',
    //     value: '',
    //     clickable: true
    //   },
    //   methods: { click: "() => { console.log('method') }" }
    // },
    {
      name: 'Checkbox',
      name_ch: '复选框',
      dependenceVersion: '*',
      dependence: {
        package: 'vant',
        export_name: 'Checkbox',
        sub_name: null,
        destructuring: 1,
      },
      props: {
        value: 'checkbox',
      },
      methods: { click: "() => { console.log('method') }" },
    },
    {
      name: 'Field',
      name_alias: 'Input',
      name_ch: '输入框',
      dependenceVersion: '*',
      dependence: {
        package: 'vant',
        export_name: 'Field',
        sub_name: null,
        destructuring: 1,
      },
      props: {
        label: '文本',
        placeholder: '这里是输入框',
        value: 'val',
        name: 'name',
        rules: [{ required: true, message: 'error message' }],
      },
      methods: { click: "() => { console.log('method') }" },
    },
    {
      name: 'Switch',
      name_ch: '开关',
      dependenceVersion: '*',
      dependence: {
        package: 'vant',
        export_name: 'Switch',
        sub_name: null,
        destructuring: 1,
      },
      props: {
        value: 'switch',
      },
      methods: { click: "() => { console.log('method') }" },
    },
    {
      name: 'Radio',
      name_ch: '单选',
      dependenceVersion: '*',
      dependence: {
        package: 'vant',
        export_name: 'Radio',
        sub_name: null,
        destructuring: 1,
      },
      props: {
        value: 'radio',
      },
      methods: { click: "() => { console.log('method') }" },
    },
    {
      name: 'Search',
      name_alias: 'SearchBar',
      name_ch: '搜索框',
      dependenceVersion: '*',
      dependence: {
        package: 'vant',
        export_name: 'Search',
        sub_name: null,
        destructuring: 1,
      },
      props: {
        value: 'searchVal',
      },
      methods: {
        'update:model-value': "() => { console.log('method') }",
        search: "() => { console.log('search') }",
        cancel: "() => { console.log('cancel') }",
      },
    },
    {
      name: 'NoticeBar',
      name_ch: '通知栏',
      dependenceVersion: '*',
      dependence: {
        package: 'vant',
        export_name: 'NoticeBar',
        sub_name: null,
        destructuring: 1,
      },
      props: {
        'left-icon': 'volume-o',
        text: 'this is a notice-bar',
      },
      methods: {
        click: "() => { console.log('click') }",
      },
    },
    {
      name: 'Tabs',
      name_ch: '标签页',
      dependenceVersion: '*',
      dependence: {
        package: 'vant',
        export_name: 'Tabs',
        sub_name: null,
        destructuring: 1,
      },
      props: {
        value: 'tabs',
      },
      methods: {
        'click-tab': "() => { console.log('click') }",
      },
      children: [
        {
          name: 'Tab',
          name_ch: '标签',
          dependenceVersion: '*',
          dependence: {
            package: 'vant',
            export_name: 'Tab',
            sub_name: null,
            destructuring: 1,
          },
          props: {
            title: '标签N',
            name: 'tabN',
          },
          methods: {},
        },
      ],
    },
    {
      name: 'Swipe',
      name_ch: '轮播',
      dependenceVersion: '*',
      dependence: {
        package: 'vant',
        export_name: 'Swipe',
        sub_name: null,
        destructuring: 1,
      },
      props: {
        autoplay: 3000,
      },
      methods: {
        change: "() => { console.log('change') }",
      },
      children: [
        {
          name: 'SwipeItem',
          name_ch: '轮播项',
          dependenceVersion: '*',
          dependence: {
            package: 'vant',
            export_name: 'SwipeItem',
            sub_name: null,
            destructuring: 1,
          },
          props: {},
          methods: {
            click: "() => { console.log('click') }",
          },
        },
      ],
    },
  ],
};
