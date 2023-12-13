export default {
  list: [
    {
      name: 'Button',
      dependenceVersion: '*',
      dependence: {
        package: 'antd',
        export_name: 'Button',
        sub_name: null,
        destructuring: 1,
      },
      props: {
        disabled: false,
        type: 'primary',
      },
      state: {
        btnVisible: false,
      },
    },
  ],
};
