export interface ArticleType {
    id: string;
    title?: string;  // 使用可选属性，因为有些文章可能没有标题
    author?: string;
    content: string;  // 确保这个属性是必需的
    summary?: string;  // 添加 summary 字段，设为可选
    url?: string;
    likes?: number;
    comments?: number;
    // 其他可能的属性...
}

// 如果 Article1 仍然需要单独存在
export interface Article1 {
    // Article1 的字段...
}