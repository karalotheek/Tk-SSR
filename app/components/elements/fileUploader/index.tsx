import React, { createRef } from 'react';
import SvgIcon from '@element/svgIcon';
import { connect } from 'react-redux';
import { showError } from '@context/actions';

const ERROR = {
    NOT_SUPPORTED_EXTENSION: 'NOT_SUPPORTED_EXTENSION',
    FILESIZE_TOO_LARGE: 'FILESIZE_TOO_LARGE'
}

type pageProps = typeof FileUploader.defaultProps & {
    style: object,
    fileContainerStyle: object,
    className: string,
    onChange: any,
    onDelete?: any,
    buttonClassName?: string,
    buttonStyles?: object,
    buttonType?: string,
    withPreview?: boolean,
    accept?: string,
    name?: string,
    withIcon?: boolean,
    buttonText?: string,
    withLabel?: boolean,
    label?: string,
    labelStyles?: object,
    labelClass?: string,
    imgExtension?: string[],
    maxFileSize?: number,
    fileSizeError?: string,
    fileTypeError?: string,
    errorClass?: string,
    errorStyle?: object,
    singleImage?: boolean,
    defaultImages?: any[],
    showError: any
};
type pageState = {
    pictures: any[],
    files: any[],
    fileErrors: any[]
};
class FileUploader extends React.Component<pageProps, pageState> {
    static defaultProps = {
        className: '',
        fileContainerStyle: {},
        buttonClassName: "",
        buttonStyles: {},
        withPreview: false,
        accept: "image/*",
        name: "",
        withIcon: true,
        buttonText: "Choose images",
        buttonType: "button",
        withLabel: true,
        label: "Max file size: 5mb, accepted: jpg|gif|png",
        labelStyles: {},
        labelClass: "",
        imgExtension: ['.jpg', '.jpeg', '.gif', '.png'],
        maxFileSize: 5242880,
        fileSizeError: " file size is too big",
        fileTypeError: " is not a supported file extension",
        errorClass: "",
        style: {},
        errorStyle: {},
        singleImage: false,
        onChange: () => { },
        defaultImages: []
    };
    private inputElement: any = createRef()
    constructor(props: pageProps) {
        super(props);
        this.state = {
            pictures: [...props.defaultImages],
            files: [],
            fileErrors: []
        };
        this.onDropFile = this.onDropFile.bind(this);
        this.onUploadClick = this.onUploadClick.bind(this);
        this.triggerFileUpload = this.triggerFileUpload.bind(this);
    }

    componentDidUpdate(prevProps: any, prevState: any, snapshot: any) {
        if (prevState.files !== this.state.files) {
            this.props.onChange(this.state.files, this.state.pictures);
        }
    }

    /*
     Load image at the beggining if defaultImage prop exists
     */
    componentWillReceiveProps(nextProps: any) {
        if (nextProps.defaultImages !== this.props.defaultImages) {
            this.setState({ pictures: nextProps.defaultImages });
        }
    }

    /*
       Check file extension (onDropFile)
       */
    hasExtension(fileName: any) {
        const pattern = '(' + this.props.imgExtension.join('|').replace(/\./g, '\\.') + ')$';
        return new RegExp(pattern, 'i').test(fileName);
    }

    /*
     Handle file validation
     */
    onDropFile(e: any) {
        const files = e.target.files;
        const allFilePromises = [];
        const fileErrors = [];

        // Iterate over all uploaded files
        for (let i = 0; i < files.length; i++) {
            let file = files[i];
            let fileError = {
                name: file.name,
            };
            // Check for file extension
            if (!this.hasExtension(file.name)) {
                fileError = Object.assign(fileError, {
                    type: ERROR.NOT_SUPPORTED_EXTENSION
                });
                fileErrors.push(fileError);
                continue;
            }
            // Check for file size
            if (file.size > this.props.maxFileSize) {
                fileError = Object.assign(fileError, {
                    type: ERROR.FILESIZE_TOO_LARGE
                });
                fileErrors.push(fileError);
                continue;
            }

            allFilePromises.push(this.readFile(file));
        }

        fileErrors.length != 0 && fileErrors.map((fileError: any, index: number) => {
            if (fileError.type === ERROR.FILESIZE_TOO_LARGE) {
                this.props.showError(`${fileError.name} ${this.props.fileSizeError}`)
            } else {
                this.props.showError(`${fileError.name} ${this.props.fileTypeError}`)
            }
        });

        const { singleImage } = this.props;

        Promise.all(allFilePromises).then(newFilesData => {
            const dataURLs = singleImage ? [] : this.state.pictures.slice();
            const files = singleImage ? [] : this.state.files.slice();

            newFilesData.forEach((newFileData: any) => {
                dataURLs.push(newFileData.dataURL);
                files.push(newFileData.file);
            });

            this.setState({ pictures: dataURLs, files: files });
        });
    }

    onUploadClick(e: any) {
        e.target.value = null;
    }

    /*
       Read a file and return a promise that when resolved gives the file itself and the data URL
     */
    readFile(file: any) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();

            // Read the image via FileReader API and save image result in state.
            reader.onload = function (e: any) {
                // Add the file name to the data URL
                let dataURL = e.target.result;
                dataURL = dataURL.replace(";base64", `;name=${file.name};base64`);
                resolve({ file, dataURL });
            };

            reader.readAsDataURL(file);
        });
    }

    /*
     Remove the image from state
     */
    removeImage(picture: any) {
        const removeIndex = this.state.pictures.findIndex(e => e === picture);
        const filteredPictures = this.state.pictures.filter((e, index) => index !== removeIndex);
        const filteredFiles = this.state.files.filter((e, index) => index !== removeIndex);

        this.setState({ pictures: filteredPictures, files: filteredFiles }, () => {
            this.props.onChange(this.state.files, this.state.pictures);
        });
    }

    /*
     Check if any errors && render
     */
    renderErrors() {
        const { fileErrors } = this.state;
        return fileErrors.map((fileError, index) => {
            if (fileError.type === ERROR.FILESIZE_TOO_LARGE) {
                this.props.showError(`${fileError.name} ${this.props.fileSizeError}`, 4000)
            } else {
                this.props.showError(`${fileError.name} ${this.props.fileTypeError}`, 4000)
            }
        });
    }

    /*
     Render label
     */
    renderLabel() {
        if (this.props.withLabel) {
            return <p className={this.props.labelClass} style={this.props.labelStyles}>{this.props.label}</p>
        }
    }

    /*
     On button click, trigger input file to open
     */
    triggerFileUpload() {
        this.inputElement.click();
    }

    clearPictures() {
        this.setState({ pictures: [] })
    }

    render() {
        return (
            <div className={"fileUploader " + this.props.className} style={this.props.style}>
                <div className="fileContainer" style={this.props.fileContainerStyle}>
                    {this.renderLabel()}
                    <div className="clearfix action-btn-wrap" onClick={() => this.triggerFileUpload()}>
                        <div className="action-btn-icon">
                            <SvgIcon icon="attachFile" />
                        </div>
                        <div className="action-btn-text">{this.props.buttonText}</div>
                    </div>
                    <input
                        type="file"
                        ref={input => this.inputElement = input}
                        name={this.props.name}
                        multiple={!this.props.singleImage}
                        onChange={this.onDropFile}
                        onClick={this.onUploadClick}
                        accept={this.props.accept}
                    />
                </div>

            </div>
        )
    }
}

const mapDispatchToProps = (dispatch: any) => {
    return {
        showError: (error: string, time: number) => dispatch(showError(error, time))
    }
};

export default connect(null, mapDispatchToProps)(FileUploader);
